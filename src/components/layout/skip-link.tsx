import { cn, focusRing } from "@/lib/utils";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground",
        focusRing,
      )}
    >
      Skip to content
    </a>
  );
}
