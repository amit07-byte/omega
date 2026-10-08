import type { ComponentProps } from "react";
import type { VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaLinkProps = ComponentProps<"a"> & VariantProps<typeof buttonVariants>;

export function CtaLink({
  className,
  variant,
  size = "cta",
  ...props
}: CtaLinkProps) {
  return (
    <a className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}
