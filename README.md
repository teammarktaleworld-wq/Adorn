# Adorn

The website for **Adorn The Event Company** (a unit of Marktale World): royal Indian weddings, sangeet nights, haldi and mehendi, and birthdays, told as one scrolling journey.

## The journey

| Chapter | What happens |
| --- | --- |
| Welcome | A revolving 3D world of floating places (palace, haldi garden, DJ stage, birthday castle, invitation). Scrolling turns it; clicking a place opens its chapter. |
| The Royal Wedding | Palace at dusk, bride and groom portraits, a 3D mandap walk-through, and the five rituals in a horizontal scroll. |
| After Dark | DJ booth, lasers, a dancing crowd and fireworks you can launch. |
| Kiara Turns Two | A princess birthday: balloons you can pop, a crowned foil "2" and a cake to blow out. |
| The Atelier | A 3D gallery of meaningful objects (deepam, kalash, genda, kandil, mukut) you can turn by hand. |
| What We Adorn / The Adorn Way | Services (each row opens the enquiry with that celebration chosen) and the five-step process. |
| Begin Yours | An invitation-card enquiry form, sealed in gold wax when sent. |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Three.js with React Three Fiber · GSAP with ScrollTrigger and SplitText · Lenis smooth scrolling. All 3D models, textures and illustrations are generated in code, so there are no heavy image or model files.

## Run locally

Requires Node 20.9 or newer.

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev                  # http://localhost:3000
npm run build && npm start   # production build
npm run typecheck
```

## Environment variables

| Name | Needed for |
| --- | --- |
| `ENQUIRY_WEBHOOK_URL` | Delivering enquiries. Server-only. Any endpoint that accepts a JSON `POST` (Slack incoming webhook, Zapier, Make, a CRM). Without it the form says online enquiries are not switched on yet and, if set, offers email or WhatsApp instead. |
| `NEXT_PUBLIC_SITE_URL` | Canonical links, sitemap and share images. Optional on Vercel, which provides the production domain. |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_INSTAGRAM_URL` | Contact details in the enquiry section and footer. Each shows only when set. |

The webhook receives:

```json
{
  "text": "New enquiry from the Adorn website\n\nName: …\nEmail: …",
  "enquiry": { "name": "", "email": "", "phone": "", "celebration": "", "date": "", "venue": "", "guests": "", "message": "" },
  "receivedAt": "2026-11-02T10:00:00.000Z"
}
```

`text` is ready to post into Slack as-is. A hidden honeypot field filters out simple bots.

## Deploy on Vercel

1. Import the repository in Vercel. The framework is detected as **Next.js**; keep the default build command (`next build`) and output settings.
2. Under **Settings → Environment Variables**, add `ENQUIRY_WEBHOOK_URL` and any of the contact variables, for Production (and Preview if you want enquiries from previews).
3. Deploy. Add your custom domain under **Settings → Domains**, and set `NEXT_PUBLIC_SITE_URL` to it if you want canonical links to use that domain on preview builds too.

The home page is statically generated; only `/api/enquiry` runs as a serverless function.

## Notes

- Phones and low-powered devices get lighter 3D scenes, and scenes pause when they are off screen.
- With "reduce motion" switched on, the doors, intros and scroll animations are skipped and every scene shows its final state.
- The palace imagery is inspired by a real wedding but deliberately names no venue or location.
