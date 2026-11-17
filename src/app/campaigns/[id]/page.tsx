import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { authFieldClassName } from "@/components/auth/auth-screen";
import { Container } from "@/components/layout/container";
import { Feedback, statusLabel } from "@/components/marketplace/feedback";
import { Button } from "@/components/ui/button";
import { loadAccount } from "@/lib/auth/profile";
import { applyToCampaign } from "@/lib/marketplace/actions";
import { isMissingRelation, marketplaceErrorMessage } from "@/lib/marketplace/errors";
import { creatorApplicationForCampaign, getPublishedCampaign, hasCreatorProfile } from "@/lib/marketplace/queries";

export const metadata: Metadata = {
  title: "Campaign",
  robots: { index: false, follow: false },
};

type CampaignPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default function CampaignPage({ params, searchParams }: CampaignPageProps) {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading campaign…</p>}>
        <CampaignDetails params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function CampaignDetails({ params, searchParams }: CampaignPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const { campaign, error } = await getPublishedCampaign(id);
  if (error && isMissingRelation(error)) {
    return <p role="alert" className="text-sm text-destructive">{marketplaceErrorMessage(error)}</p>;
  }
  if (!campaign) {
    notFound();
  }

  const account = await loadAccount();
  const existing = account?.profile?.role === "creator"
    ? await creatorApplicationForCampaign(account.userId, campaign.id)
    : null;
  const profile = account?.profile?.role === "creator" ? await hasCreatorProfile(account.userId) : null;

  return (
    <article className="mx-auto w-full max-w-2xl">
      <Link href="/campaigns" className="text-sm font-medium text-primary">
        All campaigns
      </Link>
      <p className="mt-6 text-sm text-muted-foreground">
        {campaign.businessName} · {campaign.category}
      </p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">{campaign.title}</h1>
      <p className="mt-4 text-base leading-7">{campaign.summary}</p>
      <dl className="mt-8 grid gap-4 rounded-3xl border bg-card p-6 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted-foreground">Deliverable</dt>
          <dd className="mt-1">{campaign.deliverable}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Location</dt>
          <dd className="mt-1">{campaign.neighborhood}, {campaign.city}</dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="font-heading text-2xl tracking-tight">Apply</h2>
        <div className="mt-4">
          <Feedback error={query.error} notice={query.notice} />
        </div>
        {!account ? (
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            <Link href="/login" className="font-medium text-primary">Log in</Link> as a creator to apply. New here?{" "}
            <Link href="/signup" className="font-medium text-primary">Create a creator account</Link>.
          </p>
        ) : null}
        {account?.profile?.role === "business" ? (
          <p className="mt-4 text-sm text-muted-foreground">Business accounts publish campaigns. Creator accounts apply.</p>
        ) : null}
        {account?.profile?.role === "creator" && profile && !profile.exists ? (
          <p className="mt-4 text-sm leading-6">
            <Link href="/creator/onboarding" className="font-medium text-primary">Finish your creator profile</Link> before applying.
          </p>
        ) : null}
        {existing?.status ? (
          <p className="mt-4 text-sm" role="status">
            Your application is {statusLabel(existing.status).toLowerCase()}.{" "}
            <Link href="/creator/applications" className="font-medium text-primary">View applications</Link>
          </p>
        ) : null}
        {account?.profile?.role === "creator" && profile?.exists && !existing?.status ? (
          <form action={applyToCampaign} className="mt-4 grid gap-4">
            <input type="hidden" name="campaignId" value={campaign.id} />
            <label className="grid gap-2 text-sm font-medium">
              Why you are a fit
              <textarea className={`${authFieldClassName} h-auto py-3`} name="message" required minLength={10} maxLength={600} rows={5} />
            </label>
            <Button type="submit" size="cta">Send application</Button>
          </form>
        ) : null}
      </section>
    </article>
  );
}
