'use client';

import { useMemo, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { Palace } from '@/components/art/Palace';
import styles from './PalaceDusk.module.css';

const rand = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Dusk to night at the palace: the sun sinks, the windows light floor by floor, fairy lights trace
// the domes, and sky lanterns rise over the water.
export function PalaceDusk() {
  const root = useRef<HTMLElement>(null);
  const stars = useMemo(() => {
    const r = rand(3);
    return Array.from({ length: 70 }, () => ({ left: `${r() * 100}%`, top: `${r() * 100}%`, scale: 0.4 + r() * 1.2 }));
  }, []);
  const lanterns = useMemo(() => {
    const r = rand(9);
    return Array.from({ length: 14 }, (_, i) => ({ left: `${6 + r() * 88}%`, rise: 70 + r() * 60, delay: i / 14, sway: (r() - 0.5) * 8 }));
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) {
        gsap.set(q(`.${styles.night}, .${styles.stars}, .palace-lit, .palace-lights`), { opacity: 1 });
        gsap.set(q(`.${styles.beat}`), { autoAlpha: 0 });
        gsap.set(q(`.${styles.beat}`)[2], { autoAlpha: 1 });
        return;
      }
      const beats = q(`.${styles.beat}`);
      gsap.set(beats.slice(1), { autoAlpha: 0, y: 40 });
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.6 } });
      tl.to(q(`.${styles.sun}`), { yPercent: 95, scale: 0.85, duration: 0.45 }, 0)
        .to(q(`.${styles.sun}`), { opacity: 0, duration: 0.15 }, 0.32)
        .to(q(`.${styles.night}`), { opacity: 1, duration: 0.35 }, 0.22)
        .to(q(`.${styles.stars}`), { opacity: 1, duration: 0.3 }, 0.4)
        .to(beats[0], { autoAlpha: 0, y: -40, duration: 0.08 }, 0.22)
        .to(beats[1], { autoAlpha: 1, y: 0, duration: 0.08 }, 0.3)
        .to(beats[1], { autoAlpha: 0, y: -40, duration: 0.08 }, 0.6)
        .to(beats[2], { autoAlpha: 1, y: 0, duration: 0.08 }, 0.68);
      for (let group = 1; group <= 6; group += 1) {
        tl.to(q(`[data-lit="${group}"]`), { opacity: 1, duration: 0.06, stagger: { each: 0.004, from: 'random' } }, 0.3 + group * 0.05);
      }
      tl.to(q('.palace-lights'), { opacity: 1, duration: 0.08 }, 0.66);
      q(`.${styles.lantern}`).forEach((lantern, i) => {
        const data = lanterns[i];
        tl.fromTo(lantern, { y: 0, x: 0, opacity: 0 }, { y: () => -window.innerHeight * (data.rise / 100), x: data.sway * 6, opacity: 1, duration: 0.3 }, 0.62 + data.delay * 0.25);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`${styles.dusk} ${styles.scene}`} data-header="dark" aria-label="Dusk at the palace">
      <div className={styles.sticky}>
        <div className={styles.sky} />
        <div className={styles.sun} />
        <div className={styles.night} />
        <div className={styles.stars} aria-hidden="true">
          {stars.map((s, i) => (
            <i key={i} style={{ left: s.left, top: s.top, transform: `scale(${s.scale})` }} />
          ))}
        </div>
        <svg className={styles.hills} viewBox="0 0 1600 200" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 200V120C120 70 220 90 330 60s220 10 320-20 200 40 330 10 260-50 360-10 180 30 260 0V200Z" fill="currentColor" />
        </svg>
        <Palace className={styles.palace} />
        <Palace className={styles.reflection} />
        <div className={styles.water} aria-hidden="true" />
        <div className={styles.lanterns} aria-hidden="true">
          {lanterns.map((l, i) => (
            <span key={i} className={styles.lantern} style={{ left: l.left }} />
          ))}
        </div>
        <div className={styles.copy}>
          <p className={`display ${styles.beat}`}>Dusk, and a palace <em>holds its breath.</em></p>
          <p className={`display ${styles.beat}`}>Window by window, <em>it wakes.</em></p>
          <p className={`display ${styles.beat}`}>By nightfall, every arch <em>holds a flame.</em></p>
        </div>
        <p className={styles.caption}>
          <span className="eyebrow">Behind the scene</span>
          Inspired by a royal palace wedding we designed and managed — days of light, flowers and family.
        </p>
      </div>
    </section>
  );
}
