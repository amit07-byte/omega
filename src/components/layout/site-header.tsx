import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { siteConfig } from "@/config/site";
import { cn, focusRing } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <Container className="relative flex h-16 items-center justify-between">
        <Link
          href="/"
          className={cn("rounded-md", focusRing)}
          aria-label="Omega home"
        >
          <LogoMark />
        </Link>
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {siteConfig.nav.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "inline-flex rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
                    focusRing,
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <MobileNav links={siteConfig.nav} />
      </Container>
    </header>
  );
}
