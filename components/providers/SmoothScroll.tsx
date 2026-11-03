'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsap';

let lenis: Lenis | null = null;

export const getLenis = () => lenis;

// Smoothly scrolls to a section id, or jumps when smooth scrolling is off.
export function scrollToId(id: string) {
  const target = id === 'top' ? 0 : document.getElementById(id);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.6, offset: 0 });
  } else if (target === 0) {
    window.scrollTo({ top: 0 });
  } else {
    target.scrollIntoView();
  }
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.4 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // Sections change height after load (sticky scenes switch on, fonts settle, the enquiry card
  // folds away), so scroll positions are recalculated whenever the page height changes.
  useEffect(() => {
    let height = document.body.scrollHeight;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      const next = document.body.scrollHeight;
      if (Math.abs(next - height) < 2) return;
      height = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 160);
    });
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return <>{children}</>;
}
