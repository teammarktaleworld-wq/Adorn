'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { useLiteMode, useOnScreen } from '@/lib/hooks';
import styles from './Mandap.module.css';

const MandapScene = dynamic(() => import('@/components/three/MandapScene'), { ssr: false });

const beats = [
  { label: 'The mandap', title: <>Four pillars. <em>One sacred fire.</em></>, text: 'At the heart of every Hindu wedding stands the mandap. Ours was built to be walked around, looked up at, remembered.' },
  { label: 'The pillars', title: <>Wrapped in silk, <em>wound with marigold.</em></>, text: 'Red silk striped with gold, marigold spiralling to the capital, and ivory drapes that move with the evening breeze.' },
  { label: 'The canopy', title: <>Look up: <em>a sky of flowers.</em></>, text: 'A velvet dome with gilded ribs, and ladis of genda and jasmine strung strand by strand along every edge.' },
  { label: 'The pheras', title: <>Seven circles, <em>seven vows.</em></>, text: 'The saat phere around the agni — the moment everything else is designed to frame.' },
  { label: 'The blessing', title: <>And then, <em>a shower of petals.</em></>, text: 'Rose and marigold falling over the couple as the families rise to their feet.' },
];

// A walk around the 3D mandap, driven by scroll: wide shot, pillars, canopy, fire, finale.
export function Mandap() {
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root, '100px');
  const lite = useLiteMode();
  const progress = useMemo(() => ({ current: 0 }), []);
  const [step, setStep] = useState(0);
  // Mounted once when first approached, then paused off screen rather than torn down.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (onScreen) setMounted(true);
  }, [onScreen]);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const items = q(`.${styles.beat}`);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          progress.current = self.progress;
          setStep(Math.min(beats.length - 1, Math.floor(self.progress * beats.length * 0.999)));
        },
      });
      if (reduce) return;
      gsap.set(items.slice(1), { autoAlpha: 0, y: 30 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.5 } });
      items.forEach((item, i) => {
        if (i > 0) tl.to(item, { autoAlpha: 1, y: 0, duration: 0.25 }, i - 0.22);
        if (i < items.length - 1) tl.to(item, { autoAlpha: 0, y: -30, duration: 0.22 }, i + 0.52);
      });
      tl.to({}, { duration: 0.4 }, items.length - 0.4);
    },
    { scope: root },
  );

  return (
    <section ref={root} className={styles.mandap} data-header="dark" aria-labelledby="mandap-title">
      <div className={styles.sticky}>
        <div className={styles.canvas} aria-hidden="true">
          {mounted && <MandapScene active={onScreen} lite={lite} progress={progress} />}
        </div>
        <div className={styles.shade} aria-hidden="true" />
        <h2 id="mandap-title" className={`display ${styles.title}`}>Mandap</h2>
        <div className={styles.beats}>
          {beats.map((beat) => (
            <div key={beat.label} className={styles.beat}>
              <p className="eyebrow">{beat.label}</p>
              <h3 className="display">{beat.title}</h3>
              <p>{beat.text}</p>
            </div>
          ))}
        </div>
        <ol className={styles.meter} aria-hidden="true">
          {beats.map((beat, i) => (
            <li key={beat.label} data-on={i === step}>{beat.label.replace('The ', '')}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
