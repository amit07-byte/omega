export const FREE_CAMPAIGN_LIMIT = 1;

export type BusinessPlan = "free" | "paid";

export function isBusinessPlan(value: unknown): value is BusinessPlan {
  return value === "free" || value === "paid";
}

export function canCreateCampaign(plan: BusinessPlan, existingCount: number): boolean {
  if (plan === "paid") {
    return true;
  }

  return existingCount < FREE_CAMPAIGN_LIMIT;
}

export const campaignLimitMessage =
  "A free plan includes one campaign. A paid plan is required for another.";
