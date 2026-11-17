import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Feedback, statusLabel } from "@/components/marketplace/feedback";
import { requireAccount } from "@/lib/marketplace/access";
import { isMissingRelation, marketplaceErrorMessage } from "@/lib/marketplace/errors";
import { listCreatorApplications } from "@/lib/marketplace/queries";

export const metadata: Metadata = {
  title: "Your applications",
  robots: { index: false, follow: false },
};

type ApplicationsPageProps = {
  searchParams: Promise<{ notice?: string; error?: string }>;
};

export default function CreatorApplicationsPage({ searchParams }: ApplicationsPageProps) {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading applications…</p>}>
        <Applications searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function Applications({ searchParams }: ApplicationsPageProps) {
  const account = await requireAccount("creator");
  const query = await searchParams;
  const { applications, error } = await listCreatorApplications(account.userId);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Creator</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight">Your applications</h1>
      <div className="mt-6">
        <Feedback error={query.error} notice={query.notice} />
      </div>
      {error ? (
        <p role="alert" className="mt-6 text-sm text-destructive">
          {isMissingRelation(error) ? marketplaceErrorMessage(error) : "Applications could not be loaded."}
        </p>
      ) : null}
      {!error && applications.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          You have not applied yet. <Link href="/campaigns" className="font-medium text-primary">Browse campaigns</Link>
        </p>
      ) : null}
      <ul className="mt-8 grid gap-4">
        {applications.map((application) => (
          <li key={application.id} className="rounded-3xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">{statusLabel(application.status)} · {application.businessName}</p>
            <h2 className="mt-2 font-heading text-2xl tracking-tight">
              <Link href={`/campaigns/${application.campaignId}`}>{application.campaignTitle}</Link>
            </h2>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm">
        <Link href="/creator/onboarding" className="font-medium text-primary">Edit creator profile</Link>
        {" · "}
        <Link href="/account" className="font-medium text-primary">Account</Link>
      </p>
    </div>
  );
}
