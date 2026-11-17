import { authFieldClassName } from "@/components/auth/auth-screen";
import { Feedback } from "@/components/marketplace/feedback";
import { Button } from "@/components/ui/button";
import { saveCampaign } from "@/lib/marketplace/actions";
import type { OwnedCampaign } from "@/lib/marketplace/queries";

const areaClassName = `${authFieldClassName} h-auto py-3`;

export function CampaignForm({
  campaign,
  error,
  notice,
}: {
  campaign?: OwnedCampaign;
  error?: string;
  notice?: string;
}) {
  const published = campaign?.status === "published";

  return (
    <form action={saveCampaign} className="grid gap-4">
      {campaign ? <input type="hidden" name="campaignId" value={campaign.id} /> : null}
      <Feedback error={error} notice={notice} />
      <label className="grid gap-2 text-sm font-medium">
        Title
        <input className={authFieldClassName} name="title" required minLength={4} maxLength={80} defaultValue={campaign?.title ?? ""} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        What do you need?
        <textarea className={areaClassName} name="summary" required minLength={10} maxLength={600} rows={5} defaultValue={campaign?.summary ?? ""} />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        What the creator delivers
        <input className={authFieldClassName} name="deliverable" required minLength={4} maxLength={200} defaultValue={campaign?.deliverable ?? ""} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          City
          <input className={authFieldClassName} name="city" required minLength={2} maxLength={80} defaultValue={campaign?.city ?? ""} />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Neighborhood
          <input className={authFieldClassName} name="neighborhood" required minLength={2} maxLength={80} defaultValue={campaign?.neighborhood ?? ""} />
        </label>
      </div>
      <div className="flex flex-wrap gap-3">
        {published ? null : (
          <Button type="submit" name="intent" value="draft" variant="outline" size="cta">
            Save draft
          </Button>
        )}
        <Button type="submit" name="intent" value={published ? "save" : "publish"} size="cta">
          {published ? "Save changes" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
