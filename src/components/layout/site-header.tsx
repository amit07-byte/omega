import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CtaLink } from "@/components/ui/cta-link";
import { siteConfig } from "@/config/site";
import { cn, focusRing } from "@/lib/utils";

const accountLinks = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
] as const;

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
        <div className="flex items-center gap-2">
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
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className={cn(
                "inline-flex rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
                focusRing,
              )}
            >
              Log in
            </Link>
            <CtaLink href="/signup" size="sm">
              Sign up
            </CtaLink>
          </div>
          <MobileNav links={[...siteConfig.nav, ...accountLinks]} />
        </div>
      </Container>
    </header>
  );
}
