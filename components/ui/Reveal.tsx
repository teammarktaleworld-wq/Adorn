'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';

type Props = { as?: ElementType; className?: string; children: ReactNode; id?: string; delay?: number; start?: string };

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lines rise out of masks as the block scrolls into view. Re-splits on resize and font load.
export function RevealLines({ as: Tag = 'h2', className, children, id, delay = 0, start = 'top 85%' }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (!ref.current || reduced()) return;
    SplitText.create(ref.current, {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 112,
          duration: 1.3,
          delay,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: { trigger: ref.current, start, once: true },
        }),
    });
  });
  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}

// Words brighten one by one as the reader scrolls through the passage.
export function ScrollLitWords({ as: Tag = 'p', className, children, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (!ref.current || reduced()) return;
    SplitText.create(ref.current, {
      type: 'words',
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.16 },
          { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 82%', end: 'bottom 52%', scrub: true } },
        ),
    });
  });
  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}

// Fades and lifts any block into place. Content stays focusable while hidden, and
// shows at once if keyboard focus reaches it before the reader scrolls there.
export function Rise({ as: Tag = 'div', className, children, delay = 0, start = 'top 88%' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  useGSAP(() => {
    if (!ref.current || reduced()) return;
    tween.current = gsap.from(ref.current, { y: 40, opacity: 0, duration: 1.2, delay, ease: 'expo.out', scrollTrigger: { trigger: ref.current, start, once: true } });
  });
  return (
    <Tag ref={ref} className={className} onFocus={() => tween.current?.progress(1)}>
      {children}
    </Tag>
  );
}
