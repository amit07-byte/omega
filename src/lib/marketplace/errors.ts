export const marketplaceSetupMessage =
  "Marketplace tables are not available yet. Apply supabase/migrations/20261117120000_marketplace.sql in the Supabase SQL editor, then try again.";

export function isMissingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /relation .* does not exist/i.test(error.message ?? "") ||
    /schema cache/i.test(error.message ?? "")
  );
}

export function marketplaceErrorMessage(error: { code?: string; message?: string } | null): string {
  if (isMissingRelation(error)) {
    return marketplaceSetupMessage;
  }
  if (error?.code === "P0001" && error.message) {
    return error.message;
  }
  if (error?.code === "23505") {
    return "You already applied to this campaign.";
  }
  if (error?.message?.includes("free plan")) {
    return error.message;
  }
  return "That could not be saved. Try again.";
}
