import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/landing/section-heading";
import { siteConfig } from "@/config/site";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-t bg-card/60"
    >
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          id="how-it-works-heading"
          eyebrow="How Omega works"
          title="From a local brief to a collaboration."
          description="Omega is built around a simple path: a business describes the work, creators nearby can find it, and the right person applies."
        />
        <ol className="mt-12 grid list-none gap-4 md:grid-cols-3 md:gap-6">
          {siteConfig.steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="rounded-2xl border bg-background p-6"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Icon className="size-5" />
                  </span>
                  <span
                    aria-hidden="true"
                    className="font-heading text-2xl text-muted-foreground/70"
                  >
                    {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-xl tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
