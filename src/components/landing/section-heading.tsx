import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  eyebrowClassName?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  eyebrowClassName = "text-primary",
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p
        className={cn(
          "text-sm font-medium tracking-wide uppercase",
          eyebrowClassName,
        )}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-3 font-heading text-3xl tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        {description}
      </p>
    </div>
  );
}
