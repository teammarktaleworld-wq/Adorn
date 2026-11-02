'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { getLenis } from '@/components/providers/SmoothScroll';
import { AdornMark } from '@/components/brand/Logo';
import styles from './Doors.module.css';

const SEEN = 'adorn-doors-seen';

function DoorArch() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 300V150c0-20 10-36 26-44-2-18 10-34 28-38 4-18 22-30 42-28 10-14 28-22 46-18 12-14 32-22 38-22s26 8 38 22c18-4 36 4 46 18 20-2 38 10 42 28 18 4 30 20 28 38 16 8 26 24 26 44v150" />
        <path d="M44 300V160c0-14 8-26 20-32-1-14 8-26 22-29 3-14 17-23 32-21 8-11 22-17 36-14 10-11 25-17 46-17s36 6 46 17c14-3 28 3 36 14 15-2 29 7 32 21 14 3 23 15 22 29 12 6 20 18 20 32v140" opacity=".6" />
      </g>
      <g fill="currentColor" opacity=".9">
        <circle cx="200" cy="150" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <ellipse key={i} cx={200 + Math.cos(a) * 38} cy={150 + Math.sin(a) * 38} rx="9" ry="4" transform={`rotate(${(a * 180) / Math.PI} ${200 + Math.cos(a) * 38} ${150 + Math.sin(a) * 38})`} />;
        })}
        <circle cx="200" cy="150" r="7" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".55">
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} d={`M${70 + i * 43} 300v-70`} />
        ))}
        <path d="M60 230h280" />
      </g>
    </svg>
  );
}

function Knocker() {
  return (
    <svg viewBox="0 0 100 140" aria-hidden="true">
      <g fill="none" stroke="currentColor">
        <circle cx="50" cy="40" r="26" strokeWidth="5" />
        <circle cx="50" cy="40" r="10" strokeWidth="3" />
        <path d="M50 66c-22 0-34 18-34 38s14 32 34 32 34-12 34-32-12-38-34-38Z" strokeWidth="6" />
      </g>
      <circle cx="50" cy="40" r="4" fill="currentColor" />
    </svg>
  );
}

// The palace doors that open onto the night. Shown once per visit; skipped for reduced motion.
export function Doors() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.doors === 'skip') {
      setGone(true);
      window.dispatchEvent(new Event('adorn:open'));
      return;
    }
    const el = root.current;
    if (!el) return;
    html.style.overflow = 'hidden';
    let started = false;
    const lockLenis = window.setInterval(() => getLenis()?.stop(), 50);

    const open = () => {
      if (started) return;
      started = true;
      window.clearInterval(lockLenis);
      try {
        sessionStorage.setItem(SEEN, '1');
      } catch {
        // Storage blocked: the doors simply play again next time.
      }
      const q = gsap.utils.selector(el);
      gsap.timeline({
        onComplete: () => {
          html.style.overflow = '';
          getLenis()?.start();
          setGone(true);
        },
      })
        .to(q(`.${styles.emblem}`), { scale: 0.86, autoAlpha: 0, duration: 0.6, ease: 'power2.in' })
        .to(q(`.${styles.left}`), { rotateY: -108, duration: 1.7, ease: 'power3.inOut' }, 0.25)
        .to(q(`.${styles.right}`), { rotateY: 108, duration: 1.7, ease: 'power3.inOut' }, 0.25)
        .to(q(`.${styles.light}`), { scale: 1.35, duration: 1.7, ease: 'power2.inOut' }, 0.25)
        .call(() => window.dispatchEvent(new Event('adorn:open')), undefined, 0.85)
        .to(el, { autoAlpha: 0, duration: 0.7, ease: 'power1.out' }, 1.35);
    };

    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    const timer = window.setTimeout(() => ready.then(open), 1500);
    const button = el.querySelector('button');
    button?.addEventListener('click', open);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(lockLenis);
      button?.removeEventListener('click', open);
    };
  }, []);

  if (gone) return null;

  return (
    <div ref={root} className={styles.doors}>
      <div className={styles.light} aria-hidden="true" />
      <div className={`${styles.leaf} ${styles.left}`} aria-hidden="true">
        <div className={styles.frame} />
        <div className={styles.arch}><DoorArch /></div>
        <div className={styles.studs} />
        <div className={styles.ring}><Knocker /></div>
      </div>
      <div className={`${styles.leaf} ${styles.right}`} aria-hidden="true">
        <div className={styles.frame} />
        <div className={styles.arch}><DoorArch /></div>
        <div className={styles.studs} />
        <div className={styles.ring}><Knocker /></div>
      </div>
      <div className={styles.emblem}>
        <AdornMark className={styles.emblemMark} />
        <p className={`deva ${styles.welcome}`} lang="hi">स्वागतम्</p>
        <p className={styles.name}>ADORN</p>
        <p className="eyebrow">The Event Company</p>
        <button type="button" className={styles.enter}>Enter the celebration</button>
      </div>
    </div>
  );
}
