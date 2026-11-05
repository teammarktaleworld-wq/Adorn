import { NextResponse } from 'next/server';
import { celebrations, EMAIL_PATTERN, guestCounts, summarise, type Enquiry } from '@/lib/enquiry';

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const oneOf = (value: unknown, allowed: readonly string[]) => (typeof value === 'string' && allowed.includes(value) ? value : '');

// Validates an enquiry and forwards it to EmailJS (or webhook in ENQUIRY_WEBHOOK_URL).
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  // The hidden "company" field is only ever filled in by bots.
  if (text(body.company, 200)) return NextResponse.json({ ok: true });

  const enquiry: Enquiry = {
    name: text(body.name, 120),
    email: text(body.email, 160),
    phone: text(body.phone, 32),
    celebration: oneOf(body.celebration, celebrations.map((c) => c.value)),
    date: /^\d{4}-\d{2}-\d{2}$/.test(text(body.date, 10)) ? text(body.date, 10) : '',
    venue: text(body.venue, 160),
    guests: oneOf(body.guests, guestCounts),
    message: text(body.message, 3000),
  };

  if (enquiry.name.length < 2 || !EMAIL_PATTERN.test(enquiry.email)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 422 });
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.EMAILJS_USER_ID || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const webhook = process.env.ENQUIRY_WEBHOOK_URL;

  const hasEmailJS = Boolean(serviceId && templateId && publicKey);
  const hasWebhook = Boolean(webhook);

  if (!hasEmailJS && !hasWebhook) {
    return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });
  }

  let sent = false;

  // 1. Deliver via EmailJS
  if (hasEmailJS) {
    try {
      const templateParams = {
        name: enquiry.name,
        from_name: enquiry.name,
        user_name: enquiry.name,
        email: enquiry.email,
        from_email: enquiry.email,
        user_email: enquiry.email,
        reply_to: enquiry.email,
        phone: enquiry.phone || 'Not provided',
        user_phone: enquiry.phone || 'Not provided',
        celebration: enquiry.celebration || 'Not specified',
        date: enquiry.date || 'Not specified',
        venue: enquiry.venue || 'Not specified',
        city: enquiry.venue || 'Not specified',
        guests: enquiry.guests || 'Not specified',
        guest_count: enquiry.guests || 'Not specified',
        message: enquiry.message || 'No additional message',
        summary: summarise(enquiry),
        submitted_at: new Date().toISOString(),
      };

      const emailPayload: Record<string, unknown> = {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: templateParams,
      };

      if (privateKey) {
        emailPayload.accessToken = privateKey;
      }

      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': origin,
        },
        body: JSON.stringify(emailPayload),
        signal: AbortSignal.timeout(10000),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        throw new Error(`EmailJS responded with ${emailResponse.status}: ${errText}`);
      }

      sent = true;
    } catch (error) {
      console.error('EmailJS delivery failed:', error);
      if (!hasWebhook) {
        return NextResponse.json({ ok: false, error: 'delivery' }, { status: 502 });
      }
    }
  }

  // 2. Deliver via Webhook if configured
  if (hasWebhook) {
    try {
      const webhookResponse = await fetch(webhook!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `New enquiry from the Adorn website\n\n${summarise(enquiry)}`,
          enquiry,
          receivedAt: new Date().toISOString(),
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook answered ${webhookResponse.status}`);
      }
      sent = true;
    } catch (error) {
      console.error('Webhook delivery failed:', error);
      if (!sent) {
        return NextResponse.json({ ok: false, error: 'delivery' }, { status: 502 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
