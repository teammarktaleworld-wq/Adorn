'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useOnScreen } from '@/lib/hooks';
import { Crowd } from '@/components/art/Crowd';
import { RevealLines } from '@/components/ui/Reveal';
import styles from './AfterDark.module.css';

const COLORS = ['#ffd27a', '#fe9313', '#fe4a02', '#ff4fa0', '#7dffcf', '#fff6e4'];

type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type Rocket = { x: number; y: number; vy: number; targetY: number; color: string };

const beams = [
  { left: '12%', beam: '#ff4fa0', from: '-38deg', to: '18deg', speed: '4.2s' },
  { left: '24%', beam: '#fe9313', from: '28deg', to: '-24deg', speed: '3.6s' },
  { left: '50%', beam: '#7dffcf', from: '-30deg', to: '30deg', speed: '5.2s' },
  { left: '50%', beam: '#ffd27a', from: '22deg', to: '-36deg', speed: '4.6s' },
  { left: '76%', beam: '#fe4a02', from: '-22deg', to: '30deg', speed: '3.9s' },
  { left: '88%', beam: '#b98aff', from: '36deg', to: '-18deg', speed: '4.4s' },
];

// After dark: lasers, a DJ booth, a dancing crowd, and fireworks you can launch with a tap.
export function AfterDark() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useOnScreen(root, '0px');
  const [bass, setBass] = useState(false);
  const rockets = useRef<Rocket[]>([]);
  const sparks = useRef<Spark[]>([]);

  const launch = useCallback((x?: number, y?: number) => {
    const el = canvas.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    rockets.current.push({
      x: x ?? w * (0.15 + Math.random() * 0.7),
      y: h * 0.82,
      vy: -(h * 0.018 + Math.random() * h * 0.004),
      targetY: y ?? h * (0.12 + Math.random() * 0.3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }, []);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx || !live) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      el.width = el.clientWidth * dpr;
      el.height = el.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    let last = performance.now();
    let nextAuto = last + 600;
    const burst = (r: Rocket) => {
      const count = 70 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i += 1) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.1;
        const speed = 1.6 + Math.random() * 2.6;
        sparks.current.push({ x: r.x, y: r.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1, color: Math.random() < 0.2 ? '#fff6e4' : r.color, size: 1.4 + Math.random() * 1.6 });
      }
    };
    const frame = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      if (!reduce && now > nextAuto) {
        launch();
        nextAuto = now + 900 + Math.random() * 1300;
      }
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 0, el.clientWidth, el.clientHeight);
      ctx.globalCompositeOperation = 'lighter';
      rockets.current = rockets.current.filter((r) => {
        r.y += r.vy * dt;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY) {
          burst(r);
          return false;
        }
        return true;
      });
      sparks.current = sparks.current.filter((s) => {
        s.vy += 0.035 * dt;
        s.vx *= 0.985;
        s.vy *= 0.985;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.012 * dt;
        if (s.life <= 0) return false;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.5 + s.life * 0.5), 0, Math.PI * 2);
        ctx.fill();
        return true;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [live, launch]);

  const onStageClick = (event: React.MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest('a, button')) return;
    const box = canvas.current?.getBoundingClientRect();
    if (!box) return;
    launch(event.clientX - box.left, Math.max(box.height * 0.08, event.clientY - box.top));
  };

  const dropTheBeat = () => {
    setBass(true);
    for (let i = 0; i < 6; i += 1) window.setTimeout(() => launch(), i * 140);
    window.setTimeout(() => setBass(false), 700);
  };

  return (
    <section
      ref={root}
      id="after-dark"
      className={styles.night}
      data-live={live}
      data-bass={bass}
      data-header="dark"
      aria-labelledby="after-dark-title"
      onClick={onStageClick}
    >
      <canvas ref={canvas} className={styles.fireworks} aria-hidden="true" />
      <div className={styles.lasers} aria-hidden="true">
        {beams.map((b, i) => (
          <span key={i} className={styles.laser} style={{ left: b.left, '--beam': b.beam, '--from': b.from, '--to': b.to, '--speed': b.speed } as React.CSSProperties} />
        ))}
      </div>
      <div className={styles.content}>
        <p className="eyebrow">After dark · Sangeet &amp; reception nights</p>
        <RevealLines id="after-dark-title" className={`display ${styles.title}`}>
          And then, <em>the bass dropped.</em>
        </RevealLines>
        <p className={`lede ${styles.copy}`}>
          When the rituals end, the palace becomes a dance floor — DJ and dhol, lasers and fireworks, and a floor that fills with every generation.
        </p>
        <button type="button" className={`btn btn-saffron ${styles.drop}`} onClick={dropTheBeat}>
          <span>Drop the beat</span>
        </button>
      </div>
      <p className={`eyebrow ${styles.hint}`} aria-hidden="true">Tap the sky for fireworks</p>
      <div className={styles.haze} aria-hidden="true" />
      <div className={styles.booth} aria-hidden="true">
        <div className={styles.console}>
          <span className={styles.deck} />
          <span className={styles.led}>
            <strong>ADORN</strong>
            <span className={styles.eq}>
              {Array.from({ length: 18 }, (_, i) => (
                <i key={i} style={{ '--d': `${0.28 + ((i * 7) % 9) * 0.05}s` } as React.CSSProperties} />
              ))}
            </span>
          </span>
          <span className={styles.deck} />
        </div>
      </div>
      <Crowd className={styles.crowd} />
    </section>
  );
}
