import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/landing/section-heading";
import type { Benefit } from "@/config/site";
import { cn } from "@/lib/utils";

type AudienceSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  benefits: readonly Benefit[];
  tone?: "default" | "clay";
};

export function AudienceSection({
  id,
  eyebrow,
  title,
  description,
  benefits,
  tone = "default",
}: AudienceSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("border-t", tone === "clay" && "bg-secondary/70")}
    >
      <Container className="py-16 sm:py-20 lg:py-24">
        <SectionHeading
          id={headingId}
          eyebrow={eyebrow}
          title={title}
          description={description}
          eyebrowClassName={tone === "clay" ? "text-clay" : "text-primary"}
        />
        <ul className="mt-12 grid list-none gap-4 md:grid-cols-3 md:gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li key={benefit.title} className="rounded-2xl border bg-card p-6">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    tone === "clay"
                      ? "bg-clay/15 text-clay"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 font-heading text-xl tracking-tight">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {benefit.description}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
