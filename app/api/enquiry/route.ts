import { NextResponse } from 'next/server';
import { celebrations, EMAIL_PATTERN, guestCounts, summarise, type Enquiry } from '@/lib/enquiry';

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const oneOf = (value: unknown, allowed: readonly string[]) => (typeof value === 'string' && allowed.includes(value) ? value : '');

// Validates an enquiry and forwards it to the webhook in ENQUIRY_WEBHOOK_URL
// (Slack, Zapier, Make, a CRM, or any endpoint that accepts JSON).
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

  const webhook = process.env.ENQUIRY_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ ok: false, error: 'not-configured' }, { status: 503 });

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `New enquiry from the Adorn website\n\n${summarise(enquiry)}`, enquiry, receivedAt: new Date().toISOString() }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Webhook answered ${response.status}`);
  } catch (error) {
    console.error('Enquiry could not be delivered', error);
    return NextResponse.json({ ok: false, error: 'delivery' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
