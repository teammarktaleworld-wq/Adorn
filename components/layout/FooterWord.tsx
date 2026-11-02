'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

// The closing wordmark fills with gold as the page comes to its end.
export function FooterWord({ className }: { className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(ref.current, { '--fill': '100%' });
      return;
    }
    gsap.fromTo(ref.current, { '--fill': '0%' }, { '--fill': '100%', ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } });
  });
  return (
    <p ref={ref} className={className} aria-hidden="true">
      ADORN
    </p>
  );
}
