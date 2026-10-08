import { CollaborationExample } from "@/components/landing/collaboration-example";
import { Container } from "@/components/layout/container";
import { CtaLink } from "@/components/ui/cta-link";

export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--color-primary)_0%,transparent_60%)] opacity-[0.08]"
      />
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:py-28">
        <div>
          <p className="text-sm font-medium tracking-wide text-primary uppercase">
            Local business × creator marketplace
          </p>
          <h1
            id="hero-heading"
            className="mt-4 max-w-xl font-heading text-4xl leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Connect local businesses with creators.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Omega is where neighborhood businesses and independent creators find
            each other. Businesses publish collaboration campaigns. Creators
            discover work nearby and apply.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="#businesses" className="w-full sm:w-auto">
              For businesses
            </CtaLink>
            <CtaLink
              href="#creators"
              variant="outline"
              className="w-full sm:w-auto"
            >
              For creators
            </CtaLink>
          </div>
        </div>
        <CollaborationExample />
      </Container>
    </section>
  );
}
