"use server";

import { redirect } from "next/navigation";
import { loadAccount } from "@/lib/auth/profile";
import { isMissingRelation, marketplaceErrorMessage } from "@/lib/marketplace/errors";
import { parseApplicationMessage, parseCampaign, parseCreatorProfile, parseDecision } from "@/lib/marketplace/fields";
import { canCreateCampaign, campaignLimitMessage } from "@/lib/marketplace/pricing";
import { businessPlan } from "@/lib/marketplace/queries";
import { createClient } from "@/lib/supabase/server";

function redirectWith(path: string, key: "error" | "notice", message: string): never {
  const params = new URLSearchParams();
  params.set(key, message.replace(/[\r\n]+/g, " ").slice(0, 240));
  redirect(`${path}?${params.toString()}`);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function saveCreatorProfile(formData: FormData) {
  const parsed = parseCreatorProfile(formData);
  if ("error" in parsed) {
    redirectWith("/creator/onboarding", "error", parsed.error);
  }

  const account = await loadAccount();
  if (!account || account.profile?.role !== "creator") {
    redirect("/login");
  }

  const supabase = await createClient();
  const profile = parsed.data;
  const { error: nameError } = await supabase
    .from("profiles")
    .update({ display_name: profile.displayName })
    .eq("id", account.userId);
  if (nameError) {
    redirectWith("/creator/onboarding", "error", marketplaceErrorMessage(nameError));
  }

  const { error } = await supabase.from("creator_profiles").upsert({
    id: account.userId,
    display_name: profile.displayName,
    craft: profile.craft,
    bio: profile.bio,
    city: profile.city,
    neighborhood: profile.neighborhood,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    redirectWith("/creator/onboarding", "error", marketplaceErrorMessage(error));
  }

  await supabase.auth.updateUser({ data: { display_name: profile.displayName } });
  redirect("/campaigns");
}

export async function saveCampaign(formData: FormData) {
  const parsed = parseCampaign(formData);
  const campaignId = String(formData.get("campaignId") ?? "");
  const editing = isUuid(campaignId);
  const back = editing ? `/business/campaigns/${campaignId}` : "/business/campaigns/new";
  if ("error" in parsed) {
    redirectWith(back, "error", parsed.error);
  }

  const account = await loadAccount();
  if (!account || account.profile?.role !== "business") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("id", account.userId)
    .maybeSingle();
  if (!profile) {
    redirect("/business/onboarding");
  }

  const campaign = parsed.data;
  const record = {
    title: campaign.title,
    summary: campaign.summary,
    deliverable: campaign.deliverable,
    city: campaign.city,
    neighborhood: campaign.neighborhood,
    ...(campaign.publish ? { status: "published", published_at: new Date().toISOString() } : {}),
  };

  if (!editing) {
    const usage = await businessPlan(account.userId);
    if (usage.error && isMissingRelation(usage.error)) {
      redirectWith(back, "error", marketplaceErrorMessage(usage.error));
    }
    if (!canCreateCampaign(usage.plan, usage.campaignCount)) {
      redirectWith("/business/pricing", "notice", campaignLimitMessage);
    }

    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        business_id: account.userId,
        ...record,
        status: campaign.publish ? "published" : "draft",
      })
      .select("id")
      .single();
    if (error || !data) {
      redirectWith(back, "error", marketplaceErrorMessage(error));
    }
    redirect(`/business/campaigns/${data.id}`);
  }

  const { data: existing } = await supabase
    .from("campaigns")
    .select("status, published_at")
    .eq("id", campaignId)
    .eq("business_id", account.userId)
    .maybeSingle();
  if (!existing) {
    redirect("/business/campaigns");
  }

  const status = existing.status === "published" || campaign.publish ? "published" : "draft";
  const { error } = await supabase
    .from("campaigns")
    .update({
      ...record,
      status,
      published_at:
        status === "published" ? existing.published_at ?? new Date().toISOString() : null,
    })
    .eq("id", campaignId)
    .eq("business_id", account.userId);
  if (error) {
    redirectWith(back, "error", marketplaceErrorMessage(error));
  }
  redirectWith(back, "notice", status === "published" ? "Campaign published." : "Draft saved.");
}

export async function applyToCampaign(formData: FormData) {
  const campaignId = String(formData.get("campaignId") ?? "");
  if (!isUuid(campaignId)) {
    redirect("/campaigns");
  }
  const parsed = parseApplicationMessage(formData);
  if ("error" in parsed) {
    redirectWith(`/campaigns/${campaignId}`, "error", parsed.error);
  }

  const account = await loadAccount();
  if (!account || account.profile?.role !== "creator") {
    redirect(`/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("applications").insert({
    campaign_id: campaignId,
    creator_id: account.userId,
    message: parsed.message,
    status: "pending",
  });
  if (error) {
    redirectWith(`/campaigns/${campaignId}`, "error", marketplaceErrorMessage(error));
  }
  redirectWith("/creator/applications", "notice", "Application sent.");
}

export async function decideApplication(formData: FormData) {
  const applicationId = String(formData.get("applicationId") ?? "");
  const campaignId = String(formData.get("campaignId") ?? "");
  const decision = parseDecision(formData.get("decision"));
  if (!isUuid(applicationId) || !isUuid(campaignId) || !decision) {
    redirect("/business/campaigns");
  }

  const account = await loadAccount();
  if (!account || account.profile?.role !== "business") {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status: decision, updated_at: new Date().toISOString() })
    .eq("id", applicationId)
    .eq("campaign_id", campaignId)
    .eq("status", "pending")
    .select("id");
  const back = `/business/campaigns/${campaignId}`;
  if (error) {
    redirectWith(back, "error", marketplaceErrorMessage(error));
  }
  if (!data?.length) {
    redirectWith(back, "error", "That application has already been decided.");
  }
  redirectWith(back, "notice", decision === "accepted" ? "Application accepted." : "Application rejected.");
}
