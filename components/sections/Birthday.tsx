'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useLiteMode, useMediaQuery, useOnScreen } from '@/lib/hooks';
import { Castle, Cake } from '@/components/art/Castle';
import styles from './Birthday.module.css';

const BalloonScene = dynamic(() => import('@/components/three/BalloonScene'), { ssr: false });

function Cloud({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 200 80" aria-hidden="true">
      <path d="M20 70c-14 0-20-18-6-24 0-16 18-24 32-16 6-18 34-22 44-6 12-12 34-8 38 8 16-4 32 8 26 22 10 4 8 16-4 16Z" fill="currentColor" />
    </svg>
  );
}

function Crown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 40" aria-hidden="true">
      <path d="M4 34L8 10l12 12 10-18 10 18 12-12 4 24Z" fill="currentColor" />
      <circle cx="8" cy="9" r="3" fill="currentColor" />
      <circle cx="30" cy="4" r="3.4" fill="#ff8fb5" />
      <circle cx="52" cy="9" r="3" fill="currentColor" />
      <rect x="4" y="34" width="48" height="4" rx="1" fill="currentColor" />
    </svg>
  );
}

const CONFETTI = ['#e8c27a', '#f4b6c2', '#c7a6e8', '#bfd9f2', '#e98aa6', '#ffffff'];

// Kiara's princess birthday: a pastel sky, a castle, balloons to pop, a foil "2" that rises and
// is crowned, her moment, and a cake to blow out.
export function Birthday() {
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root, '120px');
  const lite = useLiteMode();
  const wide = useMediaQuery('(min-aspect-ratio: 1/1)');
  const progress = useMemo(() => ({ current: 0 }), []);
  const [mounted, setMounted] = useState(false);
  const [lit, setLit] = useState(true);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (onScreen) setMounted(true);
  }, [onScreen]);

  const sparkles = useMemo(
    () => Array.from({ length: 22 }, (_, i) => ({ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 70}%`, delay: `${(i % 7) * 0.4}s` })),
    [],
  );

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(q(`.${styles.beat}`), { autoAlpha: 0 });
        gsap.set(q(`.${styles.moment}`), { autoAlpha: 1 });
        return;
      }
      const beats = q(`.${styles.beat}`);
      gsap.set(beats.slice(1), { autoAlpha: 0, y: 40 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
      tl.to(beats[0], { autoAlpha: 0, y: -40, duration: 0.1 }, 0.22)
        .to(beats[1], { autoAlpha: 1, y: 0, duration: 0.1 }, 0.3)
        .to(beats[1], { autoAlpha: 0, y: -40, duration: 0.1 }, 0.52)
        .to(beats[2], { autoAlpha: 1, y: 0, duration: 0.12 }, 0.6)
        .fromTo(q(`.${styles.castle}`), { yPercent: 10 }, { yPercent: 0, duration: 1, ease: 'none' }, 0)
        .to({}, { duration: 0.2 }, 0.8);
      gsap.to(q(`.${styles.cloud}`), { xPercent: (i) => (i % 2 ? -30 : 30), ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    },
    { scope: root },
  );

  const toggleWish = () => {
    setLit((value) => !value);
    if (lit) setBurst((n) => n + 1);
  };

  return (
    <>
      <section ref={root} id="kiara" className={styles.birthday} data-header="light" aria-labelledby="kiara-title">
        <div className={styles.sticky}>
          <div className={styles.sky} aria-hidden="true" />
          <Cloud className={styles.cloud} style={{ left: '4%', top: '16%', width: '18vw' }} />
          <Cloud className={styles.cloud} style={{ right: '8%', top: '10%', width: '22vw' }} />
          <Cloud className={styles.cloud} style={{ left: '38%', top: '30%', width: '12vw' }} />
          <div className={styles.sparkles} aria-hidden="true">
            {sparkles.map((s, i) => (
              <i key={i} style={{ left: s.left, top: s.top, animationDelay: s.delay }} />
            ))}
          </div>
          <Castle className={styles.castle} />
          <div className={styles.canvas}>
            {mounted && <BalloonScene active={onScreen} lite={lite} wide={wide} progress={progress} />}
          </div>
          <div className={styles.overlay}>
            <div className={styles.beat}>
              <p className="eyebrow">Chapter two</p>
              <h2 id="kiara-title" className="display">
                A princess <em>turns two.</em>
              </h2>
              <p className="lede">Dreamy pastels, oversized balloons and a castle of blooms — a princess garden designed for Kiara&apos;s second birthday.</p>
            </div>
            <div className={styles.beat}>
              <p className="eyebrow">The centrepiece</p>
              <h3 className="display">
                A giant <em>foil two,</em> crowned.
              </h3>
              <p>Rose-gold balloons, a tiara on top and a sky full of pastel colour — every element chosen for a two-year-old&apos;s sense of wonder.</p>
            </div>
            <div className={`${styles.beat} ${styles.moment}`}>
              <Crown className={styles.crown} />
              <p className="eyebrow">Celebrating</p>
              <p className={styles.name}>Kiara</p>
              <p className={styles.age}>2nd Birthday</p>
              <p className={styles.date}>6 January 2014</p>
            </div>
          </div>
          <p className={`eyebrow ${styles.hint}`}>Tap a balloon to pop it</p>
        </div>
      </section>
      <section className={styles.wish} data-header="light" aria-labelledby="wish-title">
        <Cake className={styles.wishArt} lit={lit} />
        <div>
          <p className="eyebrow" style={{ color: '#9a5a7a' }}>Make a wish</p>
          <h3 id="wish-title" className="display">
            Happy birthday, <em>little princess.</em>
          </h3>
          <p>Every detail, from the arch of balloons to the crown on the cake, styled by Adorn. Go on — blow out the candles.</p>
          <button type="button" className={`btn ${styles.wishButton}`} onClick={toggleWish} aria-pressed={!lit}>
            <span>{lit ? 'Blow out the candles' : 'Light them again'}</span>
          </button>
          <p className="sr-only" aria-live="polite">{lit ? '' : 'Candles blown out. Wish made!'}</p>
        </div>
        {burst > 0 && (
          <div key={burst} className={styles.confetti} aria-hidden="true">
            {Array.from({ length: 60 }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${(i * 17) % 100}%`,
                  background: CONFETTI[i % CONFETTI.length],
                  animationDelay: `${(i % 10) * 0.04}s`,
                  '--dx': `${((i * 37) % 120) - 60}px`,
                  '--r': `${(i * 97) % 720}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
