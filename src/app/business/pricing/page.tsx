import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Feedback } from "@/components/marketplace/feedback";
import { requireAccount } from "@/lib/marketplace/access";
import { FREE_CAMPAIGN_LIMIT } from "@/lib/marketplace/pricing";
import { businessPlan } from "@/lib/marketplace/queries";

export const metadata: Metadata = {
  title: "Pricing",
  robots: { index: false, follow: false },
};

type PricingPageProps = {
  searchParams: Promise<{ notice?: string; error?: string }>;
};

export default function PricingPage({ searchParams }: PricingPageProps) {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading pricing…</p>}>
        <Pricing searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Pricing({ searchParams }: PricingPageProps) {
  const account = await requireAccount("business");
  const usage = await businessPlan(account.userId);
  const query = await searchParams;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Business</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">Pricing</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
        Creators use Omega for free. A business can publish {FREE_CAMPAIGN_LIMIT} campaign on the free plan.
        More campaigns need a paid plan. Checkout is not connected, so this screen cannot start a subscription.
      </p>
      <div className="mt-6">
        <Feedback error={query.error} notice={query.notice} />
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-heading text-2xl tracking-tight">Free</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">One campaign, including draft and published.</p>
          <p className="mt-6 text-sm font-medium">{usage.plan === "free" ? "Current plan" : "Included"}</p>
        </section>
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-heading text-2xl tracking-tight">Paid</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Additional campaigns after the free one. Payment is not available yet.</p>
          <button
            type="button"
            disabled
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-base font-medium text-primary-foreground opacity-50"
          >
            Payments are not available yet
          </button>
          <p className="mt-3 text-sm text-muted-foreground">
            {usage.plan === "paid" ? "This account is already on a paid plan." : "Your plan stays free until a payment is recorded."}
          </p>
        </section>
      </div>
      <p className="mt-8 text-sm">
        <Link href="/business/campaigns" className="font-medium text-primary">Back to campaigns</Link>
      </p>
    </div>
  );
}
