import { Suspense } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { CtaLink } from "@/components/ui/cta-link";
import { siteConfig } from "@/config/site";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { cn, focusRing } from "@/lib/utils";

const accountLinks = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
] as const;

function GuestAccountLinks() {
  return (
    <>
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
      <MobileNav links={[{ href: "/campaigns", label: "Campaigns" }, ...siteConfig.nav, ...accountLinks]} />
    </>
  );
}

async function AccountLinks() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return <GuestAccountLinks />;
  }

  return (
    <>
      <div className="hidden items-center gap-2 md:flex">
        <Link
          href="/account"
          className={cn(
            "inline-flex rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
            focusRing,
          )}
        >
          Account
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>
      <MobileNav
        links={[
          { href: "/campaigns", label: "Campaigns" },
          ...siteConfig.nav,
          { href: "/account", label: "Account" },
        ]}
      />
    </>
  );
}

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
              <li>
                <Link
                  href="/campaigns"
                  className={cn(
                    "inline-flex rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground",
                    focusRing,
                  )}
                >
                  Campaigns
                </Link>
              </li>
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
          <Suspense fallback={<GuestAccountLinks />}>
            <AccountLinks />
          </Suspense>
        </div>
      </Container>
    </header>
  );
}
