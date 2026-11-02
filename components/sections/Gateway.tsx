'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import styles from './Gateway.module.css';

const ARCH = 'M10 400V170c0-26 13-46 33-55-3-24 13-44 36-49 5-23 28-38 54-36 13-18 36-28 60-23 16-18 42-28 47-28s31 10 47 28c24-5 47 5 60 23 26-2 49 13 54 36 23 5 39 25 36 49 20 9 33 29 33 55v230';

type Props = { id: string; numeral: string; kicker: string; title: React.ReactNode; sub: string; header?: 'dark' | 'light' };

// A chapter opening: nested palace arches rush past as the reader scrolls through them.
export function Gateway({ id, numeral, kicker, title, sub, header = 'dark' }: Props) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(root);
      const arches = q(`.${styles.arch}`);
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: true } });
      arches.forEach((arch, i) => {
        const startScale = 0.35 + i * 0.28;
        tl.fromTo(arch, { scale: startScale, opacity: 0.25 + i * 0.12 }, { scale: startScale * 5.5, opacity: 0, duration: 1 }, 0);
      });
      tl.fromTo(q(`.${styles.inner}`), { scale: 1, opacity: 1 }, { scale: 1.25, opacity: 0, duration: 0.45 }, 0.45)
        .to(q(`.${styles.dusk}`), { opacity: 1, duration: 0.3 }, 0.7);
      gsap.from(q(`.${styles.inner} > *`), { y: 40, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 60%', once: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} id={id} className={styles.gateway} data-header={header} aria-labelledby={`${id}-title`}>
      <div className={styles.sticky}>
        <div className={styles.arches} aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} className={styles.arch} viewBox="0 0 520 400">
              <path d={ARCH} fill="none" stroke="currentColor" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
              <path d={ARCH} fill="none" stroke="currentColor" strokeWidth={0.6} vectorEffect="non-scaling-stroke" transform="translate(16 12) scale(.94)" opacity=".6" />
            </svg>
          ))}
        </div>
        <div className={styles.inner}>
          <span className={`deva ${styles.numeral}`} aria-hidden="true">{numeral}</span>
          <p className={`eyebrow ${styles.kicker}`}>{kicker}</p>
          <h2 id={`${id}-title`} className={`display ${styles.title}`}>{title}</h2>
          <p className={`lede ${styles.sub}`}>{sub}</p>
        </div>
        <div className={styles.dusk} aria-hidden="true" />
      </div>
    </section>
  );
}
