import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authFieldClassName } from "@/components/auth/auth-screen";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import {
  isBusinessProfileComplete,
  readBusinessProfile,
} from "@/lib/auth/business-profile";
import { onboardingPathForRole } from "@/lib/auth/onboarding";
import { loadAccount } from "@/lib/auth/profile";
import { saveBusinessProfile } from "@/lib/auth/save-business-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Business onboarding",
  robots: { index: false, follow: false },
};

type BusinessOnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default function BusinessOnboardingPage({ searchParams }: BusinessOnboardingPageProps) {
  return (
    <Container className="py-16 sm:py-20">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading your account…</p>}
      >
        <BusinessOnboarding searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function BusinessOnboarding({ searchParams }: BusinessOnboardingPageProps) {
  const account = await loadAccount();
  if (!account) {
    redirect("/login");
  }
  if (account.profile?.role && account.profile.role !== "business") {
    redirect(onboardingPathForRole(account.profile.role));
  }

  const { error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const profile = readBusinessProfile(data.user?.user_metadata);
  const finished = isBusinessProfileComplete(data.user?.user_metadata);

  return (
    <div className="mx-auto w-full max-w-xl">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">
        Business
      </p>
      <h1 className="mt-3 font-heading text-3xl tracking-tight">
        Set up your business
      </h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">
        {finished
          ? "Update your business profile."
          : "Your business profile is not finished yet."}
      </p>
      <form action={saveBusinessProfile} className="mt-8 grid gap-4">
        {error ? (
          <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <label className="grid gap-2 text-sm font-medium">
          Business name
          <input
            className={authFieldClassName}
            name="businessName"
            defaultValue={profile.businessName}
            autoComplete="organization"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Category
          <input
            className={authFieldClassName}
            name="category"
            defaultValue={profile.category}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Description
          <textarea
            className={`${authFieldClassName} h-auto min-h-28 py-2`}
            name="description"
            defaultValue={profile.description}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Website
          <input
            className={authFieldClassName}
            name="website"
            type="url"
            defaultValue={profile.website}
            placeholder="https://"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Instagram
          <input
            className={authFieldClassName}
            name="instagram"
            defaultValue={profile.instagram}
            autoComplete="off"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          TikTok
          <input
            className={authFieldClassName}
            name="tiktok"
            defaultValue={profile.tiktok}
            autoComplete="off"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          City
          <input
            className={authFieldClassName}
            name="city"
            defaultValue={profile.city}
            autoComplete="address-level2"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Neighborhood
          <input
            className={authFieldClassName}
            name="neighborhood"
            defaultValue={profile.neighborhood}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Logo
          <input
            className={authFieldClassName}
            name="logo"
            type="file"
            accept="image/png,image/jpeg,image/webp"
          />
        </label>
        {profile.logoPath ? (
          <p className="text-sm text-muted-foreground">A logo is already saved.</p>
        ) : null}
        <Button type="submit" size="cta" className="mt-2 w-full">
          Save business profile
        </Button>
      </form>
      <form action={signOut} className="mt-4">
        <Button type="submit" variant="outline" size="cta">
          Log out
        </Button>
      </form>
    </div>
  );
}
