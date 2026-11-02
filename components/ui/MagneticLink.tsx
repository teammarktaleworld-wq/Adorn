'use client';

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { gsap } from '@/lib/gsap';
import { scrollToId } from '@/components/providers/SmoothScroll';

type Props = { href: string; className?: string; children: ReactNode; strength?: number; ariaLabel?: string };

// A button-like link that leans toward the pointer and glides to in-page sections.
export function MagneticLink({ href, className, children, strength = 0.28, ariaLabel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const box = el.getBoundingClientRect();
    gsap.to(el, {
      x: (event.clientX - box.left - box.width / 2) * strength,
      y: (event.clientY - box.top - box.height / 2) * strength,
      duration: 0.4,
      ease: 'power3.out',
    });
  };
  const onLeave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' });

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) return;
    event.preventDefault();
    scrollToId(href.slice(1));
  };

  return (
    <a ref={ref} href={href} className={className} onMouseMove={onMove} onMouseLeave={onLeave} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
