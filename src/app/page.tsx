import { AudienceSection } from "@/components/landing/audience-section";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <AudienceSection {...siteConfig.businesses} />
      <AudienceSection {...siteConfig.creators} tone="clay" />
      <FinalCta />
    </>
  );
}
