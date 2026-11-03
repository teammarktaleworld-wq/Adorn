'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { useLiteMode, useMediaQuery, useOnScreen, usePrefersReducedMotion } from '@/lib/hooks';
import { getLenis, scrollToId } from '@/components/providers/SmoothScroll';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { Arrow } from '@/components/ui/Arrow';
import styles from './Hero.module.css';

const WorldCarousel = dynamic(() => import('@/components/three/WorldCarousel'), { ssr: false });

const places = [
  { id: 'wedding', short: 'Weddings', title: 'Royal Weddings', line: 'Palaces, mandaps and family celebrations that last for days.', cta: 'Enter the wedding' },
  { id: 'rituals', short: 'Haldi & Mehendi', title: 'Haldi & Mehendi', line: 'Sunlit mornings, a marigold swing, henna and haldi.', cta: 'See the rituals' },
  { id: 'after-dark', short: 'DJ Nights', title: 'Sangeet & DJ Nights', line: 'A stage, the lights and a dance floor that never empties.', cta: 'Into the night' },
  { id: 'kiara', short: 'Birthdays', title: 'Birthdays', line: 'Princess castles, oversized balloons and pure wonder.', cta: 'Visit the castle' },
  { id: 'enquire', short: 'Your celebration', title: 'Your Celebration', line: 'Tell us the date and the dream. We will design the rest.', cta: 'Begin planning' },
];

const pad = (n: number) => String(n).padStart(2, '0');

// The landing: a revolving world of floating celebrations. Scrolling turns it, and each
// place opens its own chapter of the site.
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(section, '0px');
  const lite = useLiteMode();
  const still = usePrefersReducedMotion();
  const touch = useMediaQuery('(pointer: coarse)');
  const [active, setActive] = useState(0);
  const [hint, setHint] = useState<'wait' | 'show' | 'gone'>('wait');
  const shared = useMemo(() => ({ progress: { current: 0 }, started: { current: false }, pointer: { current: { x: 0, y: 0 } } }), []);
  const activeRef = useRef(0);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      shared.pointer.current = { x: (event.clientX / window.innerWidth) * 2 - 1, y: -((event.clientY / window.innerHeight) * 2 - 1) };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [shared]);

  const scrollToPlace = useCallback((index: number) => {
    const el = section.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + (el.offsetHeight - window.innerHeight) * (index / (places.length - 1));
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y });
  }, []);

  const onActive = useCallback((index: number) => {
    activeRef.current = index;
    setActive(index);
  }, []);

  // The place facing you opens its chapter; any other place turns to face you first.
  const onPick = useCallback(
    (index: number) => {
      if (index === activeRef.current) scrollToId(places[index].id);
      else scrollToPlace(index);
    },
    [scrollToPlace],
  );

  useGSAP(
    () => {
      let hintTimer = 0;
      ScrollTrigger.create({
        trigger: section.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          shared.progress.current = self.progress;
          if (self.progress > 0.02) setHint('gone');
        },
      });

      const q = gsap.utils.selector(section);
      const begin = (withIntro: boolean) => {
        shared.started.current = true;
        hintTimer = window.setTimeout(() => setHint((h) => (h === 'wait' ? 'show' : h)), withIntro ? 1900 : 900);
        if (!withIntro) return;
        const split = SplitText.create(q(`.${styles.title}`), { type: 'lines', mask: 'lines' });
        gsap
          .timeline()
          .from(split.lines, { yPercent: 105, duration: 1.4, stagger: 0.12, ease: 'expo.out' }, 0.2)
          .from(q(`.${styles.eyebrow}, .${styles.place}, .${styles.index}`), { y: 20, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'power3.out' }, 0.6);
      };

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || document.documentElement.dataset.doors === 'skip') begin(!reduce);
      else window.addEventListener('adorn:open', () => begin(true), { once: true });
      return () => window.clearTimeout(hintTimer);
    },
    { scope: section },
  );

  const place = places[active];
  return (
    <section ref={section} id="top" className={styles.hero} data-header="light" aria-labelledby="hero-title">
      <div className={styles.sticky}>
        <div className={styles.sky} aria-hidden="true">
          <i className={styles.sun} />
          <i className={styles.cloud} />
          <i className={styles.cloud} />
          <i className={styles.cloud} />
        </div>
        <div className={styles.canvas}>
          <WorldCarousel
            active={onScreen}
            lite={lite}
            still={still}
            progress={shared.progress}
            started={shared.started}
            pointer={shared.pointer}
            onActive={onActive}
            onPick={onPick}
          />
        </div>

        <div className={styles.top}>
          <p className={`eyebrow ${styles.eyebrow}`}>Adorn · The Event Company</p>
          <h1 id="hero-title" className={`display ${styles.title}`}>
            Every celebration, <em>adorned.</em>
          </h1>
        </div>

        <div className={styles.place} aria-live="polite">
          <div key={place.id} className={styles.placeInner}>
            <p className={styles.count}>
              <strong>{pad(active + 1)}</strong> / {pad(places.length)}
            </p>
            <p className={`display ${styles.placeTitle}`}>{place.title}</p>
            <p className={styles.placeLine}>{place.line}</p>
          </div>
          <MagneticLink href={`#${place.id}`} className={`btn btn-saffron ${styles.cta}`}>
            <span>{place.cta}</span>
            <Arrow />
          </MagneticLink>
        </div>

        <nav className={styles.index} aria-label="Celebrations">
          <ol>
            {places.map((p, i) => (
              <li key={p.id}>
                <a
                  href={`#${p.id}`}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    scrollToId(p.id);
                  }}
                  onMouseEnter={() => scrollToPlace(i)}
                >
                  <span>{pad(i + 1)}</span>
                  {p.short}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.dots} aria-hidden="true">
          {places.map((p, i) => (
            <i key={p.id} data-on={i === active} />
          ))}
        </div>

        <div className={styles.hint} data-state={hint} aria-hidden={hint !== 'show'}>
          <span className={styles.gesture} data-touch={touch}>
            <i />
          </span>
          <p>
            <strong>{touch ? 'Swipe up' : 'Scroll'}</strong> to turn the world
            <br />
            {touch ? 'Tap' : 'Click'} a place to step inside
          </p>
        </div>
      </div>
    </section>
  );
}
