'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { useLiteMode, useMediaQuery, useOnScreen } from '@/lib/hooks';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { Arrow } from '@/components/ui/Arrow';
import styles from './Hero.module.css';

const DiyaNight = dynamic(() => import('@/components/three/DiyaNight'), { ssr: false });

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(section, '0px');
  const lite = useLiteMode();
  const wide = useMediaQuery('(min-aspect-ratio: 1/1)');
  const [ready, setReady] = useState(false);
  const shared = useMemo(() => ({ progress: { current: 0 }, pointer: { current: { x: 0, y: 0 } } }), []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      shared.pointer.current = { x: (event.clientX / window.innerWidth) * 2 - 1, y: -((event.clientY / window.innerHeight) * 2 - 1) };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    const timer = window.setTimeout(() => setReady(true), 250);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(timer);
    };
  }, [shared]);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
          shared.progress.current = self.progress;
        },
      });

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const doorsSkipped = document.documentElement.dataset.doors === 'skip';
      const q = gsap.utils.selector(section);
      gsap.to(q(`.${styles.top}`), {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: { trigger: section.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      if (reduce || doorsSkipped) return;

      // Behind the doors the headline waits, then rises line by line as they open.
      const split = SplitText.create(q(`.${styles.title}`), { type: 'lines', mask: 'lines' });
      const intro = gsap.timeline({ paused: true })
        .from(split.lines, { yPercent: 105, duration: 1.4, stagger: 0.12, ease: 'expo.out' })
        .from(q(`.${styles.eyebrow}, .${styles.copy}, .${styles.actions} > *, .${styles.cue}`), { y: 24, autoAlpha: 0, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0.5)
        .from(q(`.${styles.deva}`), { autoAlpha: 0, scale: 0.92, duration: 2, ease: 'power2.out' }, 0.3);
      const play = () => intro.play();
      window.addEventListener('adorn:open', play, { once: true });
      return () => window.removeEventListener('adorn:open', play);
    },
    { scope: section },
  );

  return (
    <section ref={section} id="top" className={styles.hero} data-header="dark" aria-labelledby="hero-title">
      <div className={styles.canvas} data-ready={ready} aria-hidden="true">
        {ready && <DiyaNight active={onScreen} lite={lite} wide={wide} shared={shared} />}
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <span className={`deva ${styles.deva}`} aria-hidden="true">उत्सव</span>
      <div className={styles.content}>
        <div className={styles.top}>
          <p className={`eyebrow ${styles.eyebrow}`}>Adorn · The Event Company</p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            <span>Every celebration,</span>
            <em>adorned.</em>
          </h1>
        </div>
        <div className={styles.lower}>
          <div>
            <p className={`lede ${styles.copy}`}>
              Royal weddings, sangeet nights, mehendi mornings and birthdays fit for a princess — designed with Indian heart and crafted down to the last marigold.
            </p>
            <div className={styles.actions} style={{ marginTop: '1.6rem' }}>
              <MagneticLink href="#wedding" className="btn btn-gold">
                <span>Begin the journey</span>
                <Arrow direction="down" />
              </MagneticLink>
              <MagneticLink href="#enquire" className={`btn btn-ghost ${styles.ghost}`}>
                <span>Plan your celebration</span>
              </MagneticLink>
            </div>
          </div>
          <p className={`eyebrow ${styles.cue}`} aria-hidden="true">
            <i />
            Scroll into the celebration
          </p>
        </div>
      </div>
    </section>
  );
}
