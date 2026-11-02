'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { Bride, Groom } from '@/components/art/BrideGroom';
import { ArchFrame } from '@/components/art/ArchFrame';
import { RevealLines } from '@/components/ui/Reveal';
import styles from './Portraits.module.css';

function SmallDiya({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 64" aria-hidden="true">
      <path d="M30 4C36 14 38 22 34 30c-2 4-6 5-8 2-4-6-1-16 4-28Z" fill="#fe9313" />
      <path d="M30 14c3 6 4 10 2 14-1 2-4 2-5 0-2-4 0-9 3-14Z" fill="#ffe08a" />
      <path d="M6 40c8 14 40 14 48 0-4 0-8 2-12 2H18c-4 0-8-2-12-2Z" fill="#b8893a" />
      <path d="M8 40h44c-2 12-10 20-22 20S10 52 8 40Z" fill="#9e1530" />
      <path d="M8 40h44" stroke="#d9b26a" strokeWidth="2" />
    </svg>
  );
}

// The couple, each framed in a cusped palace arch that opens as the section arrives.
export function Portraits() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(root);
      q(`.${styles.figure}`).forEach((figure, i) => {
        const clip = figure.querySelector(`.${styles.clip}`);
        const art = figure.querySelector(`.${styles.art}`);
        gsap.from(clip, { clipPath: 'inset(100% 0 0 0)', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: figure, start: 'top 80%', once: true } });
        gsap.from(art, { scale: 1.18, duration: 2.2, ease: 'expo.out', scrollTrigger: { trigger: figure, start: 'top 80%', once: true } });
        gsap.fromTo(art, { yPercent: -4 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from(figure, { x: i === 0 ? -30 : 30, rotate: i === 0 ? -1.5 : 1.5, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'top 30%', scrub: true } });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.portraits} data-header="light" aria-labelledby="couple-title">
      <div className={styles.jaali} aria-hidden="true" />
      <div className={styles.grid}>
        <figure className={styles.figure}>
          <div className={styles.archWrap}>
            <div className={styles.clip}>
              <Bride className={styles.art} />
            </div>
            <ArchFrame className={styles.frame} />
          </div>
          <figcaption className={styles.caption}>
            <strong>The Bride</strong>
            <span className="eyebrow">In heirloom red &amp; gold</span>
          </figcaption>
        </figure>
        <figure className={`${styles.figure} ${styles.groom}`}>
          <div className={styles.archWrap}>
            <div className={styles.clip}>
              <Groom className={styles.art} />
            </div>
            <ArchFrame className={styles.frame} />
          </div>
          <figcaption className={styles.caption}>
            <strong>The Groom</strong>
            <span className="eyebrow">In saffron &amp; pearls</span>
          </figcaption>
        </figure>
        <div className={styles.center}>
          <p className={`deva ${styles.vivah}`} lang="hi">शुभ विवाह</p>
          <SmallDiya className={styles.flame} />
          <p className="eyebrow" style={{ color: 'var(--gold-text)' }}>The couple</p>
          <RevealLines className="display" id="couple-title">Two families. One&nbsp;story.</RevealLines>
          <p>
            Our first sketch is never of décor — it is of the two of you. Your colours, your rituals and your families&apos; traditions become the brief for every flower and every flame.
          </p>
        </div>
      </div>
    </section>
  );
}
