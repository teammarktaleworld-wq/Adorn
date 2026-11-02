import { AdornLockup, LotusMotif } from '@/components/brand/Logo';
import { Toran } from '@/components/art/Toran';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { ScrollLink } from '@/components/ui/ScrollLink';
import { EnquireLink } from '@/components/ui/EnquireLink';
import { Arrow } from '@/components/ui/Arrow';
import { chapters, site } from '@/lib/site';
import { FooterWord } from './FooterWord';
import styles from './Footer.module.css';

const offerings = [
  { label: 'Royal weddings', celebration: 'Wedding' },
  { label: 'Haldi, mehendi & sangeet', celebration: 'Haldi, mehendi or sangeet' },
  { label: 'Engagements & roka', celebration: 'Engagement or roka' },
  { label: 'Birthdays', celebration: 'Birthday' },
  { label: 'Anniversaries', celebration: 'Anniversary or milestone' },
  { label: 'Festive evenings', celebration: 'Festive or corporate evening' },
];

export function Footer() {
  const whatsapp = site.whatsapp.replace(/\D/g, '');
  const hasContact = Boolean(site.email || site.phone || whatsapp || site.instagram);
  return (
    <footer className={`grain ${styles.footer}`} data-header="dark">
      <Toran className={styles.toran} swags={9} />

      <div className={styles.closing}>
        <p className={`eyebrow ${styles.eyebrow}`}>धन्यवाद · Thank you for walking through</p>
        <p className={`display ${styles.big}`}>
          Let&rsquo;s adorn <em>your</em> celebration.
        </p>
        <MagneticLink href="#enquire" className="btn btn-gold">
          <span>Start planning</span>
          <Arrow />
        </MagneticLink>
      </div>

      <div className={styles.grid}>
        <AdornLockup tone="ivory" className={styles.lockup} />
        <nav className={styles.col} aria-label="Footer">
          <p className={styles.head}>The journey</p>
          <ul>
            {chapters.map(({ id, label }) => (
              <li key={id}>
                <ScrollLink to={id}>{label}</ScrollLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.col}>
          <p className={styles.head}>We adorn</p>
          <ul>
            {offerings.map(({ label, celebration }) => (
              <li key={label}>
                <EnquireLink celebration={celebration}>{label}</EnquireLink>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.col}>
          <p className={styles.head}>Say namaste</p>
          <ul>
            {site.phone && (
              <li>
                <a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a>
              </li>
            )}
            {site.email && (
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            )}
            {whatsapp && (
              <li>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              </li>
            )}
            {site.instagram && (
              <li>
                <a href={site.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </li>
            )}
            {!hasContact && (
              <li>
                <ScrollLink to="enquire">Write to us through the enquiry card</ScrollLink>
              </li>
            )}
          </ul>
        </div>
      </div>

      <FooterWord className={styles.word} />

      <div className={styles.base}>
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <ScrollLink to="top" className={styles.top}>
          Back to the beginning
          <Arrow className={styles.topArrow} direction="left" />
        </ScrollLink>
      </div>
      <p className={styles.unit}>
        <LotusMotif className={styles.unitLotus} />
        <span>A Unit of Marktale World.</span>
        <LotusMotif className={styles.unitLotus} />
      </p>
    </footer>
  );
}
