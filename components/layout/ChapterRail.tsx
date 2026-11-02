'use client';

import { useEffect, useState } from 'react';
import { ScrollTrigger } from '@/lib/gsap';
import { chapters } from '@/lib/site';
import { scrollToId } from '@/components/providers/SmoothScroll';
import styles from './ChapterRail.module.css';

// A quiet index of the journey on the right edge of large screens.
export function ChapterRail() {
  const [active, setActive] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const themes = Array.from(document.querySelectorAll<HTMLElement>('[data-header]'), (section) =>
      ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => self.isActive && setTheme(section.dataset.header === 'light' ? 'light' : 'dark'),
      }),
    );
    const onTheme = (event: Event) => setTheme((event as CustomEvent<'dark' | 'light'>).detail);
    window.addEventListener('adorn:header', onTheme);
    const triggers = chapters.flatMap(({ id }, i) => {
      const section = document.getElementById(id);
      const next = chapters[i + 1] && document.getElementById(chapters[i + 1].id);
      if (!section) return [];
      return ScrollTrigger.create({
        trigger: section,
        start: 'top 50%',
        endTrigger: next || document.body,
        end: next ? 'top 50%' : 'bottom bottom',
        onToggle: (self) => self.isActive && setActive(i),
      });
    });
    return () => {
      window.removeEventListener('adorn:header', onTheme);
      [...themes, ...triggers].forEach((t) => t.kill());
    };
  }, []);

  return (
    <nav className={styles.rail} data-theme={theme} aria-label="Chapters">
      <ol>
        {chapters.map(({ id, label, deva }, i) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={i === active ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToId(id);
              }}
            >
              <span className={styles.label}>{label}</span>
              <span className={`deva ${styles.num}`} aria-hidden="true">{deva}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
