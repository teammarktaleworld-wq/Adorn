'use client';

import { useEffect, useRef, useState } from 'react';
import { AdornMark } from '@/components/brand/Logo';
import { ScrollTrigger } from '@/lib/gsap';
import { getLenis, scrollToId } from '@/components/providers/SmoothScroll';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { Arrow } from '@/components/ui/Arrow';
import styles from './Header.module.css';

const links = [
  { id: 'wedding', label: 'Weddings', num: '01' },
  { id: 'after-dark', label: 'After Dark', num: '02' },
  { id: 'kiara', label: 'Birthdays', num: '03' },
  { id: 'atelier', label: 'Atelier', num: '04' },
  { id: 'enquire', label: 'Enquire', num: '05' },
];

export function Header() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [current, setCurrent] = useState('');

  // Light or dark header depending on the section underneath it.
  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    const build = () => {
      triggers.splice(0).forEach((t) => t.kill());
      document.querySelectorAll<HTMLElement>('[data-header]').forEach((section) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top 40px',
            end: 'bottom 40px',
            onToggle: (self) => self.isActive && setTheme(section.dataset.header === 'light' ? 'light' : 'dark'),
          }),
        );
      });
      links.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return;
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => self.isActive && setCurrent(id),
          }),
        );
      });
    };
    build();
    const refresh = () => ScrollTrigger.refresh();
    // Scenes that change colour within one section (the rituals) report their own theme.
    const onTheme = (event: Event) => setTheme((event as CustomEvent<'dark' | 'light'>).detail);
    window.addEventListener('adorn:open', refresh);
    window.addEventListener('adorn:header', onTheme);
    return () => {
      window.removeEventListener('adorn:open', refresh);
      window.removeEventListener('adorn:header', onTheme);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  // Tucks away while reading down, returns when scrolling up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 240 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header ref={ref} className={styles.header} data-theme={open ? 'dark' : theme} data-hidden={hidden && !open} data-solid={solid && !open}>
        <a href="#top" className={styles.brand} onClick={go('top')}>
          <AdornMark className={styles.mark} />
          <span className={styles.word}>
            <strong>ADORN</strong> <small>The Event Company</small>
            <span className="sr-only">, back to the top</span>
          </span>
        </a>
        <nav className={styles.nav} aria-label="Primary">
          {links.slice(0, 4).map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={go(link.id)} aria-current={current === link.id}>
              {link.label}
            </a>
          ))}
        </nav>
        <MagneticLink href="#enquire" className={`btn btn-saffron ${styles.cta}`}>
          <span>Plan a celebration</span>
          <Arrow />
        </MagneticLink>
        <button type="button" className={styles.menuButton} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((v) => !v)}>
          {open ? 'Close' : 'Menu'}
          <i aria-hidden="true" />
        </button>
      </header>
      <div id="site-menu" className={styles.menu} data-open={open} aria-hidden={!open} inert={!open}>
        <ol>
          {links.map((link) => (
            <li key={link.id}>
              <a href={`#${link.id}`} onClick={go(link.id)}>
                <span>{link.num}</span>
                {link.label}
              </a>
            </li>
          ))}
        </ol>
        <div className={styles.menuFoot}>
          <span>Adorn The Event Company</span>
          <span>A Unit of Marktale World</span>
        </div>
      </div>
    </>
  );
}
