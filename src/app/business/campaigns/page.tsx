import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { statusLabel } from "@/components/marketplace/feedback";
import { CtaLink } from "@/components/ui/cta-link";
import { requireAccount } from "@/lib/marketplace/access";
import { isMissingRelation, marketplaceErrorMessage } from "@/lib/marketplace/errors";
import { canCreateCampaign } from "@/lib/marketplace/pricing";
import { businessPlan, listOwnedCampaigns } from "@/lib/marketplace/queries";

export const metadata: Metadata = {
  title: "Your campaigns",
  robots: { index: false, follow: false },
};

export default function BusinessCampaignsPage() {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading campaigns…</p>}>
        <BusinessCampaigns />
      </Suspense>
    </Container>
  );
}

async function BusinessCampaigns() {
  const account = await requireAccount("business");
  const [{ campaigns, error }, usage] = await Promise.all([
    listOwnedCampaigns(account.userId),
    businessPlan(account.userId),
  ]);
  const setupError = isMissingRelation(error) || isMissingRelation(usage.error);
  const canCreate = canCreateCampaign(usage.plan, usage.campaignCount);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Business</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-heading text-4xl tracking-tight">Your campaigns</h1>
        {canCreate ? (
          <CtaLink href="/business/campaigns/new" size="default">New campaign</CtaLink>
        ) : (
          <CtaLink href="/business/pricing" size="default" variant="outline">Upgrade to add another</CtaLink>
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Plan: {usage.plan === "paid" ? "Paid" : "Free"} · {usage.campaignCount} campaign{usage.campaignCount === 1 ? "" : "s"}
      </p>
      {setupError ? (
        <p role="alert" className="mt-6 text-sm text-destructive">{marketplaceErrorMessage(error ?? usage.error)}</p>
      ) : null}
      {account.profileMessage ? (
        <p role="status" className="mt-6 text-sm text-muted-foreground">{account.profileMessage}</p>
      ) : null}
      {!setupError && campaigns.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">You have not created a campaign yet. The first one is free.</p>
      ) : null}
      <ul className="mt-8 grid gap-4">
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <Link href={`/business/campaigns/${campaign.id}`} className="block rounded-3xl border bg-card p-6 hover:bg-muted/40">
              <p className="text-sm text-muted-foreground">{statusLabel(campaign.status)} · {campaign.neighborhood}, {campaign.city}</p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight">{campaign.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        <Link href="/business/onboarding" className="font-medium text-primary">Edit business profile</Link>
        {" · "}
        <Link href="/account" className="font-medium text-primary">Account</Link>
      </p>
    </div>
  );
}
