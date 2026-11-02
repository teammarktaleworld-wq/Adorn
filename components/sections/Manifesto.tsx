'use client';

import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { Toran } from '@/components/art/Toran';
import { Rangoli } from '@/components/art/Rangoli';
import { LotusMotif } from '@/components/brand/Logo';
import { Rise, ScrollLitWords } from '@/components/ui/Reveal';
import styles from './Manifesto.module.css';

const pillars = [
  { deva: '१', title: 'Weddings & rituals', text: 'From the first haldi to the final vidaai, every ceremony composed as one unfolding story.' },
  { deva: '२', title: 'Birthdays & milestones', text: 'Themes that make children gasp and grandparents smile — styled down to the crown on the cake.' },
  { deva: '३', title: 'Galas & gatherings', text: 'Engagements, anniversaries and evenings worth dressing up for, hosted with quiet precision.' },
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const q = gsap.utils.selector(root);
      gsap.fromTo(q(`.${styles.rangoli}`), { rotate: -40 }, { rotate: 60, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from(q(`.${styles.toran}`), { yPercent: -60, duration: 1.6, ease: 'elastic.out(1, 0.55)', scrollTrigger: { trigger: root.current, start: 'top 75%', once: true } });
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`grain ${styles.manifesto}`} data-header="light" aria-labelledby="manifesto-title">
      <Toran className={styles.toran} />
      <Rangoli className={styles.rangoli} />
      <p className={`eyebrow ${styles.head}`}>
        <LotusMotif className={styles.lotus} />
        <span className="deva" lang="hi">हमारा उत्सव</span> The Adorn way
      </p>
      <h2 id="manifesto-title" className="sr-only">The Adorn way</h2>
      <ScrollLitWords className={`display ${styles.statement}`}>
        In India, a celebration is never a single day. It is a season — of rituals and relatives, marigolds and music, nights that refuse to end. We design the whole season, so your family can simply live it.
      </ScrollLitWords>
      <div className={styles.columns}>
        {pillars.map((pillar, i) => (
          <Rise key={pillar.title} delay={i * 0.08}>
            <span className={`deva ${styles.num}`} aria-hidden="true">{pillar.deva}</span>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
          </Rise>
        ))}
      </div>
    </section>
  );
}
