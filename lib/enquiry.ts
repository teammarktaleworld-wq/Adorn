export const celebrations = [
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Haldi, mehendi or sangeet', label: 'Haldi · Mehendi · Sangeet' },
  { value: 'Engagement or roka', label: 'Engagement or roka' },
  { value: 'Birthday', label: 'Birthday' },
  { value: 'Anniversary or milestone', label: 'Anniversary' },
  { value: 'Festive or corporate evening', label: 'Festive or corporate' },
  { value: 'Something else', label: 'Something else' },
] as const;

export const guestCounts = ['under 50 guests', '50 to 150 guests', '150 to 300 guests', '300 to 600 guests', 'more than 600 guests'] as const;

export type Enquiry = {
  name: string;
  email: string;
  phone: string;
  celebration: string;
  date: string;
  venue: string;
  guests: string;
  message: string;
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function summarise(enquiry: Enquiry) {
  return [
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    enquiry.phone && `Phone: ${enquiry.phone}`,
    enquiry.celebration && `Celebration: ${enquiry.celebration}`,
    enquiry.date && `Date: ${enquiry.date}`,
    enquiry.venue && `City or venue: ${enquiry.venue}`,
    enquiry.guests && `Guests: ${enquiry.guests}`,
    enquiry.message && `\n${enquiry.message}`,
  ]
    .filter(Boolean)
    .join('\n');
}
