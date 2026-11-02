'use client';

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { gsap } from '@/lib/gsap';
import { celebrations, EMAIL_PATTERN, guestCounts, summarise, type Enquiry as Details } from '@/lib/enquiry';
import { site } from '@/lib/site';
import { LotusMotif } from '@/components/brand/Logo';
import { markPieces, toPath } from '@/components/brand/markData';
import { getLenis } from '@/components/providers/SmoothScroll';
import { RevealLines, Rise } from '@/components/ui/Reveal';
import { Arrow } from '@/components/ui/Arrow';
import styles from './Enquiry.module.css';

type Status = 'idle' | 'sending' | 'sent' | 'invalid' | 'unavailable' | 'error';

const blank: Details = { name: '', email: '', phone: '', celebration: '', date: '', venue: '', guests: '', message: '' };

const notes: Partial<Record<Status, string>> = {
  sending: 'Sealing your invitation…',
  invalid: 'Please add your name and an email address we can write back to.',
  unavailable: 'Online enquiries are not switched on just yet.',
  error: 'Something went wrong while sending. Please try again in a moment.',
};

// An irregular wax outline, so the seal looks pressed by hand.
const waxOutline = (() => {
  const points = Array.from({ length: 22 }, (_, k) => {
    const a = (k / 22) * Math.PI * 2;
    const r = 68 + Math.sin(k * 2.3) * 5 + Math.cos(k * 5.1) * 3;
    return [80 + Math.cos(a) * r, 80 + Math.sin(a) * r];
  });
  const mid = (p: number[], q: number[]) => `${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`;
  let d = `M${mid(points[21], points[0])}`;
  points.forEach((p, i) => {
    d += `Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${mid(p, points[(i + 1) % points.length])}`;
  });
  return `${d}Z`;
})();

function WaxSeal({ className }: { className?: string }) {
  const id = useId();
  const pieces = Object.values(markPieces).map((cmds) => toPath(cmds));
  return (
    <svg className={className} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-wax`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#fbe7ad" />
          <stop offset="0.45" stopColor="#d6a44e" />
          <stop offset="1" stopColor="#7e5a16" />
        </radialGradient>
      </defs>
      <path d={waxOutline} fill={`url(#${id}-wax)`} />
      <circle cx="80" cy="80" r="50" fill="none" stroke="#7e5a16" strokeWidth="3" opacity="0.55" />
      <circle cx="80" cy="81.6" r="50" fill="none" stroke="#fff4cf" strokeWidth="1.2" opacity="0.7" />
      <svg x="47" y="56" width="66" height="49" viewBox="0 0 740 552">
        <g fill="#7e5a16" opacity="0.75" transform="translate(10 14)">
          {pieces.map((d) => <path key={d} d={d} />)}
        </g>
        <g fill="#f6dc9a">
          {pieces.map((d) => <path key={d} d={d} />)}
        </g>
      </svg>
    </svg>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M4 60C4 30 12 12 34 6c10-2.6 18-2 26-2" />
      <path d="M12 60c0-20 6-32 20-38 6-2.6 12-3 16-1-4 4-10 5-15 2" />
      <path d="M20 44c3-6 8-9 14-8-3 4-8 6-14 8z" fill="currentColor" stroke="none" />
      <circle cx="44" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="40" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// The enquiry form, written as a letter on an invitation card and sealed in gold wax when sent.
export function Enquiry() {
  const [details, setDetails] = useState(blank);
  const [status, setStatus] = useState<Status>('idle');
  const [invalid, setInvalid] = useState<string[]>([]);
  const card = useRef<HTMLDivElement>(null);
  const thanks = useRef<HTMLDivElement>(null);
  const seal = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPick = (event: Event) => setDetails((d) => ({ ...d, celebration: (event as CustomEvent<string>).detail }));
    window.addEventListener('adorn:celebration', onPick);
    return () => window.removeEventListener('adorn:celebration', onPick);
  }, []);

  useEffect(() => {
    if (status !== 'sent' || !thanks.current || !seal.current) return;
    thanks.current.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    if (card.current && card.current.getBoundingClientRect().top < 0) getLenis()?.scrollTo(card.current, { offset: -96 });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const [wax, ripple, ribbons] = ['[data-wax]', '[data-ripple]', '[data-ribbons]'].map((s) => seal.current!.querySelector(s));
    const tl = gsap.timeline();
    tl.from(thanks.current.children, { y: 26, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'power3.out' })
      .fromTo(wax, { scale: 2.8, rotate: -42, opacity: 0 }, { scale: 1, rotate: -8, opacity: 1, duration: 0.5, ease: 'power4.in' }, 0.2)
      .to(card.current, { y: 6, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' })
      .fromTo(ripple, { scale: 0.7, opacity: 0.9 }, { scale: 2.6, opacity: 0, duration: 1, ease: 'power2.out' }, '<')
      .from(ribbons, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.7, ease: 'power3.out' }, '<');
    return () => {
      tl.kill();
    };
  }, [status]);

  const update = (key: keyof Details) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setDetails((d) => ({ ...d, [key]: value }));
    if (invalid.includes(key)) setInvalid((list) => list.filter((k) => k !== key));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const missing = [details.name.trim().length < 2 && 'name', !EMAIL_PATTERN.test(details.email.trim()) && 'email'].filter(Boolean) as string[];
    setInvalid(missing);
    if (missing.length) {
      setStatus('invalid');
      form.querySelector<HTMLElement>(`[name="${missing[0]}"]`)?.focus();
      return;
    }
    setStatus('sending');
    try {
      const company = (form.elements.namedItem('company') as HTMLInputElement | null)?.value ?? '';
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...details, company }),
      });
      if (response.ok) {
        if (card.current && window.matchMedia('(min-width: 1100px)').matches) card.current.style.minHeight = `${card.current.offsetHeight}px`;
        setStatus('sent');
      } else setStatus(response.status === 503 ? 'unavailable' : response.status === 422 ? 'invalid' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const startAgain = () => {
    if (card.current) card.current.style.minHeight = '';
    setDetails(blank);
    setStatus('idle');
  };

  const summary = summarise(details);
  const mailto = site.email ? `mailto:${site.email}?subject=${encodeURIComponent(`Celebration enquiry — ${details.name}`)}&body=${encodeURIComponent(summary)}` : '';
  const whatsapp = site.whatsapp ? `https://wa.me/${site.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello Adorn!\n\n${summary}`)}` : '';
  const fallback = status === 'unavailable' || status === 'error';
  const field = (key: keyof Details) => ({ name: key, value: details[key], onChange: update(key), 'aria-invalid': invalid.includes(key) || undefined });
  const sent = status === 'sent';

  return (
    <section id="enquire" className={styles.enquire} data-header="light" aria-labelledby="enquire-title">
      <div className={styles.intro}>
        <p className="eyebrow">Begin yours · निमंत्रण</p>
        <RevealLines id="enquire-title" className={`display ${styles.title}`}>
          Tell us the date. <em>We&rsquo;ll bring the marigolds.</em>
        </RevealLines>
        <Rise className={styles.introBody}>
          <p className="lede">Share a few details and a planner from our team will be in touch to talk it all through — the rituals, the guest list, the dream.</p>
          <ol className={styles.next}>
            <li><span className="deva" aria-hidden="true">१</span>We read every word you send.</li>
            <li><span className="deva" aria-hidden="true">२</span>A planner calls for chai and a conversation.</li>
            <li><span className="deva" aria-hidden="true">३</span>Your first moodboard arrives.</li>
          </ol>
          {(site.email || site.phone || site.whatsapp) && (
            <p className={styles.direct}>
              Prefer to talk?{' '}
              {site.phone && <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>}
              {site.phone && (site.email || site.whatsapp) && ' · '}
              {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
              {site.email && site.whatsapp && ' · '}
              {site.whatsapp && <a href={`https://wa.me/${site.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            </p>
          )}
        </Rise>
      </div>

      <div ref={card} className={`grain ${styles.card}`} data-sent={sent}>
        <Corner className={styles.corner} />
        <Corner className={styles.corner} />
        <Corner className={styles.corner} />
        <Corner className={styles.corner} />
        <header className={styles.cardHead}>
          <LotusMotif className={styles.lotus} />
          <p className="deva" lang="hi">शुभ निमंत्रण</p>
        </header>

        {!sent && (
          <form className={styles.form} onSubmit={submit} noValidate>
            <p className={styles.salutation}>Dear Adorn,</p>
            <fieldset className={styles.chips}>
              <legend>We are planning a celebration —</legend>
              {celebrations.map((c) => (
                <label key={c.value} className={styles.chip}>
                  <input type="radio" name="celebration" value={c.value} checked={details.celebration === c.value} onChange={update('celebration')} />
                  <span>{c.label}</span>
                </label>
              ))}
            </fieldset>
            <p className={styles.sentence}>
              on <input type="date" className={styles.field} style={{ '--w': '8.6em' } as React.CSSProperties} aria-label="Date of the celebration" {...field('date')} />, in{' '}
              <input type="text" className={styles.field} style={{ '--w': '10em' } as React.CSSProperties} placeholder="city or venue" aria-label="City or venue" autoComplete="address-level2" {...field('venue')} />, for{' '}
              <select className={styles.field} style={{ '--w': '10.5em' } as React.CSSProperties} aria-label="Number of guests" {...field('guests')}>
                <option value="">how many guests?</option>
                {guestCounts.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              .
            </p>
            <label className={styles.messageLabel} htmlFor="enquiry-message">Tell us everything — the dream, the colours, the people:</label>
            <textarea id="enquiry-message" className={styles.message} rows={4} {...field('message')} />
            <p className={styles.sign}>With love,</p>
            <input type="text" className={`${styles.field} ${styles.signature}`} placeholder="your name" aria-label="Your name" autoComplete="name" required {...field('name')} />
            <p className={styles.sentence}>
              Write back to me at{' '}
              <input type="email" className={styles.field} style={{ '--w': '12em' } as React.CSSProperties} placeholder="your email" aria-label="Your email address" autoComplete="email" inputMode="email" required {...field('email')} />{' '}
              or call me on{' '}
              <input type="tel" className={styles.field} style={{ '--w': '9.5em' } as React.CSSProperties} placeholder="phone (optional)" aria-label="Your phone number (optional)" autoComplete="tel" {...field('phone')} />.
            </p>
            <div className={styles.trap} aria-hidden="true">
              <label>
                Company
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className={styles.actions}>
              <button type="submit" className={`btn btn-saffron ${styles.send}`} disabled={status === 'sending'}>
                <span>{status === 'sending' ? 'Sealing…' : 'Seal & send'}</span>
                <Arrow />
              </button>
              <p className={styles.privacy}>We use these details only to plan your celebration with you.</p>
            </div>
            <div className={styles.status} role="status" aria-live="polite">
              {notes[status] && <p>{notes[status]}</p>}
              {fallback && (mailto || whatsapp) && (
                <p className={styles.fallback}>
                  {mailto && <a href={mailto}>Send it by email instead</a>}
                  {mailto && whatsapp && ' or '}
                  {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer">send it on WhatsApp</a>}
                </p>
              )}
            </div>
          </form>
        )}

        {sent && (
          <div ref={thanks} className={styles.thanks}>
            <p className="eyebrow">Sealed with love</p>
            <h3 tabIndex={-1}>Thank you, {details.name.trim().split(/\s+/)[0]}.</h3>
            <p>Your invitation is on its way to us. Someone from our team will be in touch soon to begin planning.</p>
            <button type="button" className={styles.again} onClick={startAgain}>
              Write another enquiry
            </button>
          </div>
        )}

        <div ref={seal} className={styles.seal} hidden={!sent} aria-hidden="true">
          <svg data-ribbons className={styles.ribbons} viewBox="0 0 120 150">
            <path d="M52 20 30 140l14-12 10 16 10-112z" fill="#d9b26a" />
            <path d="M68 20l22 120-14-12-10 16-10-112z" fill="#b8862f" />
          </svg>
          <span data-ripple className={styles.ripple} />
          <div data-wax className={styles.wax}>
            <WaxSeal />
          </div>
        </div>
      </div>
    </section>
  );
}
