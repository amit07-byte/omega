import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { marketplaceErrorMessage, isMissingRelation } from "@/lib/marketplace/errors";
import { listPublishedCampaigns } from "@/lib/marketplace/queries";

export const metadata: Metadata = {
  title: "Campaigns",
  description: "Published collaboration campaigns from local businesses.",
};

export default function CampaignsPage() {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading campaigns…</p>}>
        <CampaignList />
      </Suspense>
    </Container>
  );
}

async function CampaignList() {
  const { campaigns, error } = await listPublishedCampaigns();

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Marketplace</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">Published campaigns</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        Local businesses post the work they need. Creators apply with a short note.
      </p>
      {error ? (
        <p role="alert" className="mt-8 text-sm text-destructive">
          {isMissingRelation(error) ? marketplaceErrorMessage(error) : "Campaigns could not be loaded."}
        </p>
      ) : null}
      {!error && campaigns.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No campaigns are published yet.</p>
      ) : null}
      <ul className="mt-8 grid gap-4">
        {campaigns.map((campaign) => (
          <li key={campaign.id}>
            <Link href={`/campaigns/${campaign.id}`} className="block rounded-3xl border bg-card p-6 hover:bg-muted/40">
              <p className="text-sm text-muted-foreground">
                {campaign.businessName} · {campaign.category}
              </p>
              <h2 className="mt-2 font-heading text-2xl tracking-tight">{campaign.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{campaign.summary}</p>
              <p className="mt-4 text-sm">
                {campaign.neighborhood}, {campaign.city}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
