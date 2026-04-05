import { AboutSection } from "../components/sections/AboutSection";
import { AudienceSection } from "../components/sections/AudienceSection";
import { Hero } from "../components/sections/Hero";
import { MobileAppSection } from "../components/sections/MobileAppSection";
import { ServicesSection } from "../components/sections/ServicesSection";
import { Footer } from "../components/site/Footer";
import { Header } from "../components/site/Header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ServicesSection />
        <AudienceSection />
        <MobileAppSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  );
}
