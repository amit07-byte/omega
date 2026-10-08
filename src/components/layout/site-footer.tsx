import { LogoMark } from "@/components/brand/logo-mark";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { cn, focusRing } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <Container className="flex flex-col gap-8 py-10 sm:py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <LogoMark />
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-2 sm:items-end">
              {siteConfig.nav.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      "inline-flex rounded-md text-sm font-medium text-foreground/80 hover:text-foreground",
                      focusRing,
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="text-sm text-muted-foreground">
          © 2026 Omega. Local businesses and creators.
        </p>
      </Container>
    </footer>
  );
}
