import { isBusinessPlan, type BusinessPlan } from "@/lib/marketplace/pricing";
import { createClient } from "@/lib/supabase/server";

export type PublishedCampaign = {
  id: string;
  title: string;
  summary: string;
  deliverable: string;
  city: string;
  neighborhood: string;
  publishedAt: string | null;
  businessName: string;
  category: string;
};

export type OwnedCampaign = PublishedCampaign & {
  status: "draft" | "published";
};

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export type CampaignApplication = {
  id: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  creatorName: string;
  craft: string;
  city: string;
};

export type CreatorApplication = {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
  campaignId: string;
  campaignTitle: string;
  businessName: string;
};

type CampaignRow = {
  id: string;
  title: string;
  summary: string;
  deliverable: string;
  city: string;
  neighborhood: string;
  status: string;
  published_at: string | null;
  business_profiles: { business_name: string; category: string } | { business_name: string; category: string }[] | null;
};

function one<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function publishedFromRow(row: CampaignRow): PublishedCampaign | null {
  const business = one(row.business_profiles);
  if (!business) {
    return null;
  }
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    deliverable: row.deliverable,
    city: row.city,
    neighborhood: row.neighborhood,
    publishedAt: row.published_at,
    businessName: business.business_name,
    category: business.category,
  };
}

const campaignColumns =
  "id, title, summary, deliverable, city, neighborhood, status, published_at, business_profiles(business_name, category)";

export async function listPublishedCampaigns() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(campaignColumns)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return {
    campaigns: ((data ?? []) as CampaignRow[])
      .map(publishedFromRow)
      .filter((campaign): campaign is PublishedCampaign => campaign !== null),
    error,
  };
}

export async function getPublishedCampaign(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(campaignColumns)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  return {
    campaign: data ? publishedFromRow(data as CampaignRow) : null,
    error,
  };
}

export async function listOwnedCampaigns(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(campaignColumns)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  const campaigns = ((data ?? []) as CampaignRow[])
    .map((row) => {
      const campaign = publishedFromRow(row);
      if (!campaign || (row.status !== "draft" && row.status !== "published")) {
        return null;
      }
      return { ...campaign, status: row.status };
    })
    .filter((campaign): campaign is OwnedCampaign => campaign !== null);

  return { campaigns, error };
}

export async function getOwnedCampaign(businessId: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .select(campaignColumns)
    .eq("id", id)
    .eq("business_id", businessId)
    .maybeSingle();

  const row = data as CampaignRow | null;
  const campaign = row ? publishedFromRow(row) : null;
  const rawStatus = row?.status;
  const status = rawStatus === "draft" || rawStatus === "published" ? rawStatus : null;
  const owned: OwnedCampaign | null = campaign && status ? { ...campaign, status } : null;

  return {
    campaign: owned,
    error,
  };
}

export async function businessPlan(businessId: string): Promise<{
  plan: BusinessPlan;
  campaignCount: number;
  error: { code?: string; message?: string } | null;
}> {
  const supabase = await createClient();
  const [planResult, countResult] = await Promise.all([
    supabase.from("business_subscriptions").select("plan").eq("business_id", businessId).maybeSingle(),
    supabase.from("campaigns").select("id", { count: "exact", head: true }).eq("business_id", businessId),
  ]);

  const error = planResult.error ?? countResult.error;
  const plan = isBusinessPlan(planResult.data?.plan) ? planResult.data.plan : "free";
  return { plan, campaignCount: countResult.count ?? 0, error };
}

export async function listCampaignApplications(campaignId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, message, status, created_at, creator_profiles(display_name, craft, city)")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true });

  const applications = (data ?? [])
    .map((row) => {
      const creator = one(
        row.creator_profiles as
          | { display_name: string; craft: string; city: string }
          | { display_name: string; craft: string; city: string }[]
          | null,
      );
      if (
        !creator ||
        (row.status !== "pending" && row.status !== "accepted" && row.status !== "rejected")
      ) {
        return null;
      }
      return {
        id: row.id,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        creatorName: creator.display_name,
        craft: creator.craft,
        city: creator.city,
      } satisfies CampaignApplication;
    })
    .filter((application): application is CampaignApplication => application !== null);

  return { applications, error };
}

export async function creatorApplicationForCampaign(creatorId: string, campaignId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, status")
    .eq("creator_id", creatorId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  const status =
    data?.status === "pending" || data?.status === "accepted" || data?.status === "rejected"
      ? data.status
      : null;
  return { status, error };
}

export async function listCreatorApplications(creatorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, status, created_at, campaigns(id, title, business_profiles(business_name))")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  const applications = (data ?? [])
    .map((row) => {
      const campaign = one(
        row.campaigns as
          | { id: string; title: string; business_profiles: { business_name: string } | { business_name: string }[] | null }
          | { id: string; title: string; business_profiles: { business_name: string } | { business_name: string }[] | null }[]
          | null,
      );
      const business = campaign ? one(campaign.business_profiles) : null;
      if (
        !campaign ||
        !business ||
        (row.status !== "pending" && row.status !== "accepted" && row.status !== "rejected")
      ) {
        return null;
      }
      return {
        id: row.id,
        status: row.status,
        createdAt: row.created_at,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        businessName: business.business_name,
      } satisfies CreatorApplication;
    })
    .filter((application): application is CreatorApplication => application !== null);

  return { applications, error };
}

export async function hasCreatorProfile(creatorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("creator_profiles")
    .select("id")
    .eq("id", creatorId)
    .maybeSingle();
  return { exists: Boolean(data), error };
}
