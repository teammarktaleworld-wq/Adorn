'use client';

import { useEffect, useState, type RefObject } from 'react';

export function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduce(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduce;
}

export function useMediaQuery(media: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(media);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, [media]);
  return matches;
}

// True while the element is on screen (with a margin), so off-screen 3D scenes can stop rendering.
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = '200px') {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);
  return visible;
}

// Phones, small tablets and low-powered machines get lighter 3D scenes.
export function useLiteMode() {
  const [lite, setLite] = useState(false);
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const small = window.matchMedia('(max-width: 820px)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const weak = (nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4;
    setLite(small || coarse || weak);
  }, []);
  return lite;
}
