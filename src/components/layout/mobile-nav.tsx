"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/config/site";
import { cn, focusRing } from "@/lib/utils";

type MobileNavProps = {
  links: readonly NavItem[];
};

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    firstLinkRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function closeAndFocusButton() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  return (
    <div className="md:hidden">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        size="icon"
        className="size-11"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (open) {
            closeAndFocusButton();
            return;
          }
          setOpen(true);
        }}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </Button>
      <nav
        id={panelId}
        hidden={!open}
        aria-label="Mobile"
        className="absolute inset-x-4 top-[calc(100%+0.5rem)] z-50 rounded-2xl border bg-background p-2 shadow-lg"
      >
        <ul>
          {links.map((link, index) => (
            <li key={link.href}>
              <a
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                className={cn(
                  "block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-muted",
                  focusRing,
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
