'use client';

import type { ReactNode } from 'react';
import { scrollToId } from '@/components/providers/SmoothScroll';

// Jumps to the enquiry form with a celebration already chosen.
export function EnquireLink({ celebration, className, children }: { celebration: string; className?: string; children: ReactNode }) {
  return (
    <a
      href="#enquire"
      className={className}
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent('adorn:celebration', { detail: celebration }));
        scrollToId('enquire');
      }}
    >
      {children}
    </a>
  );
}
