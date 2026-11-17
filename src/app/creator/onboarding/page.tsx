import { Suspense } from "react";
import type { Metadata } from "next";
import { authFieldClassName } from "@/components/auth/auth-screen";
import { Container } from "@/components/layout/container";
import { Feedback } from "@/components/marketplace/feedback";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { requireAccount } from "@/lib/marketplace/access";
import { saveCreatorProfile } from "@/lib/marketplace/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Creator profile",
  robots: { index: false, follow: false },
};

type CreatorOnboardingPageProps = {
  searchParams: Promise<{ error?: string; notice?: string }>;
};

export default function CreatorOnboardingPage({ searchParams }: CreatorOnboardingPageProps) {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading your profile…</p>}>
        <CreatorProfileForm searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function CreatorProfileForm({ searchParams }: CreatorOnboardingPageProps) {
  const account = await requireAccount("creator");
  const query = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase
    .from("creator_profiles")
    .select("display_name, craft, bio, city, neighborhood")
    .eq("id", account.userId)
    .maybeSingle();

  return (
    <div className="mx-auto w-full max-w-lg">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">Creator</p>
      <h1 className="mt-3 font-heading text-3xl tracking-tight">Your profile</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Businesses see this when you apply. Creator accounts are free.
      </p>
      <form action={saveCreatorProfile} className="mt-8 grid gap-4">
        <Feedback error={query.error} notice={query.notice} />
        <label className="grid gap-2 text-sm font-medium">
          Name
          <input className={authFieldClassName} name="displayName" required minLength={2} maxLength={80} defaultValue={data?.display_name ?? account.profile?.displayName ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Craft
          <input className={authFieldClassName} name="craft" required minLength={2} maxLength={40} placeholder="Photographer" defaultValue={data?.craft ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Bio
          <textarea className={`${authFieldClassName} h-auto py-3`} name="bio" required minLength={10} maxLength={600} rows={5} defaultValue={data?.bio ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          City
          <input className={authFieldClassName} name="city" required minLength={2} maxLength={80} defaultValue={data?.city ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Neighborhood
          <input className={authFieldClassName} name="neighborhood" required minLength={2} maxLength={80} defaultValue={data?.neighborhood ?? ""} />
        </label>
        <Button type="submit" size="cta">Save profile</Button>
      </form>
      <form action={signOut} className="mt-6">
        <Button type="submit" variant="outline" size="cta">Log out</Button>
      </form>
    </div>
  );
}
