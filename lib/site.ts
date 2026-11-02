const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

export const site = {
  name: 'Adorn The Event Company',
  shortName: 'Adorn',
  parent: 'Marktale World',
  tagline: 'Every celebration, adorned.',
  description:
    'Adorn The Event Company designs royal Indian weddings, sangeet nights, mehendi mornings and magical birthdays — celebrations crafted with Indian heart, down to the last marigold.',
  url: process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : 'http://localhost:3000'),
  // Optional contact details, set in the Vercel project's environment variables.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
};

export const chapters = [
  { id: 'top', label: 'Welcome', deva: '०' },
  { id: 'wedding', label: 'The Royal Wedding', deva: '१' },
  { id: 'after-dark', label: 'After Dark', deva: '२' },
  { id: 'kiara', label: 'Kiara Turns Two', deva: '३' },
  { id: 'atelier', label: 'The Atelier', deva: '४' },
  { id: 'services', label: 'What We Adorn', deva: '५' },
  { id: 'enquire', label: 'Begin Yours', deva: '६' },
] as const;
