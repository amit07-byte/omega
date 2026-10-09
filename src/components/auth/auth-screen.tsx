import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";

type AuthScreenProps = {
  title: string;
  description: string;
  children: ReactNode;
  alternate: {
    href: string;
    prompt: string;
    label: string;
  };
};

export function AuthScreen({
  title,
  description,
  children,
  alternate,
}: AuthScreenProps) {
  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-md rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          Account
        </p>
        <h1 className="mt-3 font-heading text-3xl tracking-tight text-balance">
          {title}
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          {description}
        </p>
        {children}
        <p className="mt-6 text-sm text-muted-foreground">
          {alternate.prompt}{" "}
          <Link
            href={alternate.href}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            {alternate.label}
          </Link>
        </p>
      </div>
    </Container>
  );
}

export const authFieldClassName =
  "h-11 w-full rounded-xl border border-input bg-background px-3 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
