import { Header } from '@/components/layout/Header';
import { ChapterRail } from '@/components/layout/ChapterRail';
import { Footer } from '@/components/layout/Footer';
import { GardenSymbols } from '@/components/art/Marigold';
import { Doors } from '@/components/sections/Doors';
import { Hero } from '@/components/sections/Hero';
import { Gateway } from '@/components/sections/Gateway';
import { PalaceDusk } from '@/components/sections/PalaceDusk';
import { Portraits } from '@/components/sections/Portraits';
import { Mandap } from '@/components/sections/Mandap';
import { Rituals } from '@/components/sections/Rituals';
import { AfterDark } from '@/components/sections/AfterDark';
import { Birthday } from '@/components/sections/Birthday';
import { Atelier } from '@/components/sections/Atelier';
import { Services } from '@/components/sections/Services';
import { Method } from '@/components/sections/Method';
import { Enquiry } from '@/components/sections/Enquiry';

export default function Home() {
  return (
    <>
      <GardenSymbols />
      <Doors />
      <Header />
      <ChapterRail />
      <main id="main">
        <Hero />
        <Gateway
          id="wedding"
          numeral="01"
          kicker="Chapter one"
          title={
            <>
              The Royal <em>Wedding</em>
            </>
          }
          sub="A palace at dusk, a mandap of marigolds, and a family celebrating for days. Step inside a wedding we brought to life."
        />
        <PalaceDusk />
        <Portraits />
        <Mandap />
        <Rituals />
        <AfterDark />
        <Birthday />
        <Atelier />
        <Services />
        <Method />
        <Enquiry />
      </main>
      <Footer />
    </>
  );
}
