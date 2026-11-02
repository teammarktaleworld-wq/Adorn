'use client';

import type { ReactNode } from 'react';
import { scrollToId } from '@/components/providers/SmoothScroll';

export function ScrollLink({ to, className, children }: { to: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        scrollToId(to);
      }}
    >
      {children}
    </a>
  );
}
