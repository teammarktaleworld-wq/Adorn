'use client';

import { useRef, useState, useEffect } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { HaldiThali, MehendiMandala, PherasFire, SangeetLights, VidaaiDoli } from '@/components/art/RitualArt';
import { RevealLines } from '@/components/ui/Reveal';
import styles from './Rituals.module.css';

const rituals = [
  {
    name: 'Haldi', deva: 'हल्दी', time: 'Morning · Turmeric & marigold', Art: HaldiThali,
    bg: '#f2b705', ink: '#3d0c1c', stroke: 'rgb(61 12 28 / 0.35)',
    text: 'Turmeric paste, a courtyard of marigolds and the family’s most mischievous cousins. We design haldi mornings to be messy in all the right ways.',
    chips: ['Brass urlis', 'Marigold canopy', 'Dhol'],
  },
  {
    name: 'Mehendi', deva: 'मेहँदी', time: 'Afternoon · Henna & dholki', Art: MehendiMandala,
    bg: '#0b5d4b', ink: '#fbf6ea', stroke: 'rgb(243 226 192 / 0.35)',
    text: 'Henna artists, low seating in emerald and gold, and a dholki that never quite stops. Every detail invites the family to sit a little longer.',
    chips: ['Henna artists', 'Floor seating', 'Live dholki'],
  },
  {
    name: 'Sangeet', deva: 'संगीत', time: 'Evening · Song & dance', Art: SangeetLights,
    bg: '#1b1035', ink: '#fbf6ea', stroke: 'rgb(255 210 122 / 0.32)',
    text: 'Fairy-lit stages, rehearsed choreography and the spontaneous kind. Lights, sound and a running order that keeps every performance on cue.',
    chips: ['Stage & lights', 'Choreography', 'Sound'],
  },
  {
    name: 'Pheras', deva: 'फेरे', time: 'The muhurat · Seven vows', Art: PherasFire,
    bg: '#9e1530', ink: '#fbf6ea', stroke: 'rgb(246 214 144 / 0.35)',
    text: 'The mandap, the agni and the pandit’s chant. We keep the ceremony serene and on time, so the family can be fully present.',
    chips: ['Mandap', 'Muhurat timing', 'Petal shower'],
  },
  {
    name: 'Vidaai', deva: 'विदाई', time: 'Farewell · Petals & diyas', Art: VidaaiDoli,
    bg: '#f6e6d8', ink: '#3d0c1c', stroke: 'rgb(158 21 48 / 0.3)',
    text: 'The most emotional goodbye in Indian life, lit with diyas and showered with petals — composed with tenderness, never rushed.',
    chips: ['Doli', 'Diya path', 'Petal shower'],
  },
];

// The rituals, one full-screen colour each. On wide screens they slide past sideways as the
// reader scrolls down; on phones they stack.
export function Rituals() {
  const root = useRef<HTMLElement>(null);
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
    const update = () => setHorizontal(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      const panels = q(`.${styles.panel}`);

      if (horizontal) {
        const track = q(`.${styles.track}`)[0];
        let theme = '';
        const report = (index: number) => {
          const next = rituals[index].ink === '#fbf6ea' ? 'dark' : 'light';
          if (next === theme) return;
          theme = next;
          window.dispatchEvent(new CustomEvent('adorn:header', { detail: next }));
        };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            onUpdate: (self) => self.isActive && report(Math.round(self.progress * (panels.length - 1))),
          },
        });
        tl.to(track, { x: () => -(track.scrollWidth - window.innerWidth), duration: panels.length - 1 }, 0)
          .to(q(`.${styles.progress} i`), { scaleX: 1, duration: panels.length - 1 }, 0);
        panels.forEach((panel, i) => {
          const art = panel.querySelector(`.${styles.art}`);
          const draws = panel.querySelectorAll('[data-draw]');
          const at = Math.max(0, i - 0.6);
          tl.fromTo(art, { rotate: -25, scale: 0.8 }, { rotate: 0, scale: 1, duration: 0.8 }, at);
          tl.fromTo(panel.querySelector(`.${styles.word}`), { xPercent: 30 }, { xPercent: -10, duration: 1.6 }, at);
          if (draws.length) tl.fromTo(draws, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, stagger: 0.005 }, at);
        });
      } else {
        panels.forEach((panel) => {
          const draws = panel.querySelectorAll('[data-draw]');
          gsap.from(panel.querySelector(`.${styles.art}`), { rotate: -20, scale: 0.85, autoAlpha: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: panel, start: 'top 70%', once: true } });
          if (draws.length) gsap.fromTo(draws, { drawSVG: '0%' }, { drawSVG: '100%', duration: 2, stagger: 0.01, ease: 'power2.out', scrollTrigger: { trigger: panel, start: 'top 70%', once: true } });
        });
      }
    },
    { scope: root, dependencies: [horizontal], revertOnUpdate: true },
  );

  return (
    <>
      <div id="rituals" className={styles.intro} data-header="dark">
        <p className="eyebrow">The rituals · रस्में</p>
        <RevealLines className="display">
          Five ceremonies, <em>one unfolding story.</em>
        </RevealLines>
      </div>
      <section ref={root} className={styles.rituals} data-horizontal={horizontal} data-header="light" aria-label="The wedding rituals">
        <div className={styles.sticky}>
          <div className={styles.track}>
            {rituals.map(({ name, deva, time, Art, bg, ink, stroke, text, chips }, i) => (
              <article
                key={name}
                className={styles.panel}
                style={{ '--bg': bg, '--ink-color': ink, '--stroke': stroke } as React.CSSProperties}
                aria-labelledby={`ritual-${i}`}
              >
                <span className={`deva ${styles.word}`} aria-hidden="true">{deva}</span>
                <Art className={styles.art} />
                <div className={styles.text}>
                  <p className="eyebrow">{`0${i + 1} · ${time}`}</p>
                  <h3 id={`ritual-${i}`} className="display">{name}</h3>
                  <p className="lede">{text}</p>
                  <ul className={styles.chips}>
                    {chips.map((chip) => <li key={chip}>{chip}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <span className={styles.progress} aria-hidden="true"><i /></span>
        </div>
      </section>
    </>
  );
}
