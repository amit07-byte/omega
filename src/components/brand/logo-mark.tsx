import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="size-9 shrink-0"
      >
        <rect width="32" height="32" rx="9" className="fill-primary" />
        <circle cx="13.5" cy="16" r="5.25" className="fill-primary-foreground" />
        <circle
          cx="19.25"
          cy="16"
          r="4.4"
          fill="none"
          className="stroke-primary-foreground"
          strokeWidth="1.7"
        />
      </svg>
      <span className="font-heading text-xl tracking-tight">Omega</span>
    </span>
  );
}
