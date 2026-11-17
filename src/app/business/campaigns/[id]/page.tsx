import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { CampaignForm } from "@/components/marketplace/campaign-form";
import { Feedback, statusLabel } from "@/components/marketplace/feedback";
import { Button } from "@/components/ui/button";
import { requireAccount } from "@/lib/marketplace/access";
import { decideApplication } from "@/lib/marketplace/actions";
import { getOwnedCampaign, listCampaignApplications } from "@/lib/marketplace/queries";

export const metadata: Metadata = {
  title: "Campaign",
  robots: { index: false, follow: false },
};

type ManageCampaignPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default function ManageCampaignPage({ params, searchParams }: ManageCampaignPageProps) {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading campaign…</p>}>
        <ManageCampaign params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function ManageCampaign({ params, searchParams }: ManageCampaignPageProps) {
  const account = await requireAccount("business");
  const { id } = await params;
  const query = await searchParams;
  const { campaign } = await getOwnedCampaign(account.userId, id);
  if (!campaign) {
    notFound();
  }
  const { applications } = await listCampaignApplications(campaign.id);

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section>
        <Link href="/business/campaigns" className="text-sm font-medium text-primary">Your campaigns</Link>
        <p className="mt-6 text-sm text-muted-foreground">{statusLabel(campaign.status)}</p>
        <h1 className="mt-2 font-heading text-4xl tracking-tight">{campaign.title}</h1>
        <div className="mt-8">
          <CampaignForm campaign={campaign} error={query.error} notice={query.notice} />
        </div>
      </section>
      <section>
        <h2 className="font-heading text-2xl tracking-tight">Applicants</h2>
        <Feedback notice={applications.length === 0 ? "No applications yet." : undefined} />
        <ul className="mt-4 grid gap-4">
          {applications.map((application) => (
            <li key={application.id} className="rounded-3xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">{statusLabel(application.status)} · {application.craft}</p>
              <h3 className="mt-1 text-base font-medium">{application.creatorName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{application.city}</p>
              <p className="mt-3 text-sm leading-6">{application.message}</p>
              {application.status === "pending" ? (
                <div className="mt-4 flex gap-2">
                  <form action={decideApplication}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <input type="hidden" name="campaignId" value={campaign.id} />
                    <Button type="submit" name="decision" value="accepted" size="sm">Accept</Button>
                  </form>
                  <form action={decideApplication}>
                    <input type="hidden" name="applicationId" value={application.id} />
                    <input type="hidden" name="campaignId" value={campaign.id} />
                    <Button type="submit" name="decision" value="rejected" variant="outline" size="sm">Reject</Button>
                  </form>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
