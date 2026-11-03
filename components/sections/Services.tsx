import { MotifBalloons, MotifDiya, MotifHenna, MotifLantern, MotifMandap, MotifRings } from '@/components/art/Motifs';
import { RevealLines, Rise } from '@/components/ui/Reveal';
import { EnquireLink } from '@/components/ui/EnquireLink';
import styles from './Services.module.css';

const services = [
  { num: '01', name: 'Royal weddings', text: 'Palaces, havelis, lawns and ballrooms — the complete wedding, designed and run from the first ritual to the last dance.', fill: '#5b0f24', ink: '#fbf6ea', Motif: MotifMandap, celebration: 'Wedding' },
  { num: '02', name: 'Haldi, mehendi & sangeet', text: 'The days before the wedding, each with its own colour, music and mood.', fill: '#0b5d4b', ink: '#fbf6ea', Motif: MotifHenna, celebration: 'Haldi, mehendi or sangeet' },
  { num: '03', name: 'Engagements & roka', text: 'Intimate beginnings, beautifully set — rings, families and the first photographs together.', fill: '#c0213c', ink: '#fbf6ea', Motif: MotifRings, celebration: 'Engagement or roka' },
  { num: '04', name: 'Birthdays & first birthdays', text: 'Princess gardens and every other kind of wonder, designed for little guests and charming for the grown-ups.', fill: '#f4b6c2', ink: '#3d0c1c', Motif: MotifBalloons, celebration: 'Birthday' },
  { num: '05', name: 'Anniversaries & milestones', text: 'Silver jubilees, sixtieth birthdays, griha pravesh — the family moments that deserve a proper celebration.', fill: '#f2b705', ink: '#3d0c1c', Motif: MotifDiya, celebration: 'Anniversary or milestone' },
  { num: '06', name: 'Festive & corporate evenings', text: 'Diwali nights, launches and gatherings hosted with the warmth of a family function.', fill: '#1b1035', ink: '#fbf6ea', Motif: MotifLantern, celebration: 'Festive or corporate evening' },
];

// What Adorn designs, as a full-width index; each row floods with its own colour on hover
// and opens the enquiry form with that celebration chosen.
export function Services() {
  return (
    <section id="services" className={styles.services} data-header="light" aria-labelledby="services-title">
      <div className={styles.head}>
        <p className="eyebrow">What we adorn · हमारे उत्सव</p>
        <RevealLines id="services-title" className="display">
          Every kind of <em>celebration.</em>
        </RevealLines>
        <p className="lede">Grand or intimate, three days or three hours — the same care, the same eye, the same team from first call to last guest.</p>
      </div>
      <ul className={styles.list}>
        {services.map(({ num, name, text, fill, ink, Motif, celebration }, i) => (
          <li key={name} className={styles.row} style={{ '--fill': fill, '--ink-color': ink } as React.CSSProperties}>
            <Rise className={styles.inner} delay={i * 0.04} start="top 92%">
              <span className={styles.num} aria-hidden="true">{num}</span>
              <h3 className={styles.name}>
                <EnquireLink celebration={celebration} className={styles.link}>
                  {name}
                  <span className="sr-only"> — plan yours with us</span>
                </EnquireLink>
              </h3>
              <p className={styles.text}>{text}</p>
              <Motif className={styles.motif} />
            </Rise>
          </li>
        ))}
      </ul>
    </section>
  );
}
