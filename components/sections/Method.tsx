'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { Rangoli } from '@/components/art/Rangoli';
import styles from './Method.module.css';

const steps = [
  { deva: '१', title: 'Chai & conversation', text: 'We begin with your story — families, rituals, guest lists and the feeling you want people to leave with.' },
  { deva: '२', title: 'The moodboard', text: 'Palettes, flowers, fabrics and sketches, refined together until it feels unmistakably yours.' },
  { deva: '३', title: 'The craft', text: 'Décor, florals, lighting, entertainment and hospitality — briefed, built and rehearsed by our team.' },
  { deva: '४', title: 'The celebration', text: 'On the day, we run every cue and every vendor, so your family is free to simply celebrate.' },
  { deva: '५', title: 'The memory', text: 'When the last guest leaves, what stays is the feeling. That is the part we design for.' },
];

// How Adorn works: a rangoli turns as the steps are read, one petal-ring per step.
export function Method() {
  const root = useRef<HTMLElement>(null);
  const [scene, setScene] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1000px) and (prefers-reduced-motion: no-preference)');
    const update = () => setScene(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      gsap.fromTo(q(`.${styles.rangoli}`), { rotate: -90, scale: 0.86 }, { rotate: 90, scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      if (scene) {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => setActive(Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999))),
        });
      } else {
        gsap.from(q(`.${styles.step}`), { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1, ease: 'expo.out', scrollTrigger: { trigger: q(`.${styles.steps}`)[0], start: 'top 85%', once: true } });
      }
    },
    { scope: root, dependencies: [scene], revertOnUpdate: true },
  );

  return (
    <section ref={root} className={styles.method} data-scene={scene} data-header="dark" aria-labelledby="method-title">
      <div className={styles.sticky}>
        <div className={styles.wheel} aria-hidden="true">
          <Rangoli className={styles.rangoli} />
          <div className={styles.wheelCenter}>
            <div>
              <strong className="deva">{steps[active].deva}</strong>
              <p className="eyebrow" style={{ marginTop: '0.6rem', color: 'var(--gold)' }}>of five</p>
            </div>
          </div>
        </div>
        <div>
          <div className={styles.head}>
            <p className="eyebrow">The Adorn way · कैसे हम सजाते हैं</p>
            <h2 id="method-title" className="display">
              From the first chai <em>to the final vidaai.</em>
            </h2>
          </div>
          <ol className={styles.steps}>
            {steps.map((step, i) => (
              <li key={step.title} className={styles.step} data-on={i === active}>
                <span className="deva" aria-hidden="true">{step.deva}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
