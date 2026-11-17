import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { CampaignForm } from "@/components/marketplace/campaign-form";
import { requireAccount } from "@/lib/marketplace/access";
import { canCreateCampaign } from "@/lib/marketplace/pricing";
import { businessPlan } from "@/lib/marketplace/queries";

export const metadata: Metadata = {
  title: "New campaign",
  robots: { index: false, follow: false },
};

type NewCampaignPageProps = {
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default function NewCampaignPage({ searchParams }: NewCampaignPageProps) {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
        <NewCampaign searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function NewCampaign({ searchParams }: NewCampaignPageProps) {
  const account = await requireAccount("business");
  const usage = await businessPlan(account.userId);
  if (!canCreateCampaign(usage.plan, usage.campaignCount)) {
    redirect("/business/pricing");
  }
  const query = await searchParams;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link href="/business/campaigns" className="text-sm font-medium text-primary">Your campaigns</Link>
      <h1 className="mt-6 font-heading text-4xl tracking-tight">New campaign</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Save a draft or publish it for creators. The first campaign is included on the free plan.
      </p>
      <div className="mt-8">
        <CampaignForm error={query.error} notice={query.notice} />
      </div>
    </div>
  );
}
