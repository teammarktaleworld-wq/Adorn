'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery, useOnScreen, usePrefersReducedMotion } from '@/lib/hooks';
import { Arrow } from '@/components/ui/Arrow';
import { RevealLines } from '@/components/ui/Reveal';
import type { Spin } from '@/components/three/AtelierScene';
import styles from './Atelier.module.css';

const AtelierScene = dynamic(() => import('@/components/three/AtelierScene'), { ssr: false });

const items = [
  { name: 'Deepam', deva: 'दीपक', meaning: 'Light that welcomes.', text: 'Brass lamps line entrances, steps and lakesides, so every guest arrives into a warm glow.', bg: '#3d0c1c' },
  { name: 'Kalash', deva: 'कलश', meaning: 'Abundance, and new beginnings.', text: 'Brass, mango leaves and a fresh coconut bound in red thread — the kalash that marks the start of the rituals.', bg: '#073b30' },
  { name: 'Genda', deva: 'गेंदा', meaning: 'The flower of auspicious beginnings.', text: 'Strung into ladis, torans and curtains of colour, and scattered as petals at the pheras.', bg: '#7a2a06' },
  { name: 'Kandil', deva: 'कंदील', meaning: 'Celebration that lasts into the night.', text: 'Star lanterns hung in glowing clusters over sangeet stages and courtyard dinners.', bg: '#1b1035' },
  { name: 'Mukut', deva: 'मुकुट', meaning: 'For every little princess.', text: 'Birthday themes styled down to the crown on the cake — and the one on the birthday girl.', bg: '#6a2a4a' },
];

// The Atelier: the objects that carry meaning in an Indian celebration, one at a time in 3D.
export function Atelier() {
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root, '150px');
  const wide = useMediaQuery('(min-width: 900px)');
  const still = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const spin = useMemo<Spin>(() => ({ drag: 0, velocity: 0, dragging: false }), []);
  const drag = useRef<{ x: number; t: number } | null>(null);

  useEffect(() => {
    if (onScreen) setMounted(true);
  }, [onScreen]);

  const go = (step: number) => setIndex((i) => (i + step + items.length) % items.length);

  const onKey = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { x: event.clientX, t: performance.now() };
    spin.dragging = true;
    spin.velocity = 0;
    if (event.pointerType === 'mouse') event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current) return;
    const now = performance.now();
    const turn = (event.clientX - drag.current.x) * 0.01;
    spin.drag += turn;
    spin.velocity = Math.max(-8, Math.min(8, (turn * 1000) / Math.max(8, now - drag.current.t)));
    drag.current = { x: event.clientX, t: now };
  };
  // A quick sideways flick on touch screens moves to the next object.
  const onPointerUp = (event: React.PointerEvent) => {
    if (drag.current && event.pointerType === 'touch' && Math.abs(spin.velocity) > 6) go(spin.velocity < 0 ? 1 : -1);
    drag.current = null;
    spin.dragging = false;
  };

  const item = items[index];
  return (
    <section
      ref={root}
      id="atelier"
      className={styles.atelier}
      style={{ '--bg': item.bg } as React.CSSProperties}
      data-header="dark"
      aria-labelledby="atelier-title"
      onKeyDown={onKey}
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.canvas} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} aria-hidden="true">
        {mounted && <AtelierScene active={onScreen} index={index} spin={spin} wide={wide} still={still} />}
      </div>
      <div className={styles.panel}>
        <p className={`eyebrow ${styles.kicker}`}>The Atelier · {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</p>
        <RevealLines id="atelier-title" className={`display ${styles.title}`}>Objects that carry a blessing.</RevealLines>
        <div className={styles.item} aria-live="polite">
          <span className="deva" lang="hi">{item.deva}</span>
          <h3>{item.name}</h3>
          <p className={styles.meaning}>{item.meaning}</p>
          <p className={styles.text}>{item.text}</p>
        </div>
        <div className={styles.controls}>
          <button type="button" className={styles.arrow} onClick={() => go(-1)} aria-label="Previous object">
            <Arrow className="" direction="left" />
          </button>
          <div className={styles.dots} role="group" aria-label="Choose an object">
            {items.map((it, i) => (
              <button key={it.name} type="button" onClick={() => setIndex(i)} aria-label={it.name} aria-current={i === index}>
                <i />
              </button>
            ))}
          </div>
          <button type="button" className={styles.arrow} onClick={() => go(1)} aria-label="Next object">
            <Arrow className="" />
          </button>
        </div>
        <p className={`eyebrow ${styles.drag}`}>Drag to turn it in your hands</p>
      </div>
    </section>
  );
}
