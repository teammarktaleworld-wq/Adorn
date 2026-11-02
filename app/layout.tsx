import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost, Tiro_Devanagari_Hindi } from 'next/font/google';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { ClipPaths } from '@/components/layout/ClipPaths';
import { site } from '@/lib/site';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

const deva = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-deva',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Adorn The Event Company — Royal Indian Weddings & Celebrations',
    template: '%s · Adorn The Event Company',
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'Indian wedding planner',
    'royal palace wedding',
    'luxury wedding decor',
    'mehendi',
    'sangeet',
    'haldi',
    'mandap design',
    'princess birthday party',
    'event management India',
    'Adorn The Event Company',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: site.name,
    locale: 'en_IN',
    url: '/',
    title: 'Adorn The Event Company — Every celebration, adorned.',
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Adorn The Event Company — Every celebration, adorned.',
    description: site.description,
  },
  robots: { index: true, follow: true },
  category: 'events',
};

export const viewport: Viewport = {
  themeColor: '#2a0914',
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

// Runs before first paint: decides whether the palace doors play (first visit, motion allowed).
const bootScript = `(function(){try{var d=document.documentElement;var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(r||sessionStorage.getItem('adorn-doors-seen')){d.dataset.doors='skip'}}catch(e){document.documentElement.dataset.doors='skip'}})();`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  alternateName: 'Adorn',
  url: site.url,
  logo: `${site.url}/icon.svg`,
  slogan: site.tagline,
  description: site.description,
  parentOrganization: { '@type': 'Organization', name: site.parent },
  knowsAbout: ['Indian weddings', 'Wedding decor', 'Mehendi', 'Sangeet', 'Haldi', 'Birthday parties', 'Event management'],
  ...(site.email ? { email: site.email } : {}),
  ...(site.phone ? { telephone: site.phone } : {}),
  ...(site.instagram ? { sameAs: [site.instagram] } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable} ${deva.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <ClipPaths />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
