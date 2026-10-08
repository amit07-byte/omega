import { Container } from "@/components/layout/container";
import { CtaLink } from "@/components/ui/cta-link";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-heading" className="bg-primary text-primary-foreground">
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <h2
            id="final-cta-heading"
            className="font-heading text-3xl tracking-tight text-balance sm:text-4xl"
          >
            Bring a local business and a creator together.
          </h2>
          <p className="mt-4 text-base leading-7 text-primary-foreground/80 sm:text-lg sm:leading-8">
            See how Omega is set up for the business publishing a collaboration,
            or for the creator looking for work nearby.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CtaLink
            href="#businesses"
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
          >
            For businesses
          </CtaLink>
          <CtaLink
            href="#creators"
            variant="outline"
            className="w-full border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
          >
            For creators
          </CtaLink>
        </div>
      </Container>
    </section>
  );
}
