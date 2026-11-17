import assert from "node:assert/strict";
import test from "node:test";
import { parseApplicationMessage, parseCampaign, parseCreatorProfile, parseDecision } from "./fields.ts";
import { canCreateCampaign, FREE_CAMPAIGN_LIMIT } from "./pricing.ts";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

const campaign = {
  title: "Saturday photos",
  summary: "Need photos of the lunch service for our neighborhood page.",
  deliverable: "Ten edited photos",
  city: "Austin",
  neighborhood: "East Cesar Chavez",
};

test("a complete campaign can be saved or published", () => {
  const draft = parseCampaign(form({ ...campaign, intent: "draft" }));
  const published = parseCampaign(form({ ...campaign, intent: "publish" }));
  assert.equal("data" in draft && draft.data.publish, false);
  assert.equal("data" in published && published.data.publish, true);
});

test("campaign text has a minimum length", () => {
  const parsed = parseCampaign(form({ ...campaign, title: "Hi" }));
  assert.equal("error" in parsed, true);
});

test("creator profiles require a craft and a short bio", () => {
  const parsed = parseCreatorProfile(form({
    displayName: "Ava Cole",
    craft: "Photo",
    bio: "I photograph neighborhood restaurants.",
    city: "Austin",
    neighborhood: "East Cesar Chavez",
  }));
  assert.equal("data" in parsed && parsed.data.craft, "Photo");
  const missing = parseCreatorProfile(form({
    displayName: "Ava Cole",
    craft: "Photo",
    bio: "Too short",
    city: "Austin",
    neighborhood: "East Cesar Chavez",
  }));
  assert.equal("error" in missing, true);
});

test("application decisions are only accept or reject", () => {
  assert.equal(parseDecision("accepted"), "accepted");
  assert.equal(parseDecision("rejected"), "rejected");
  assert.equal(parseDecision("paid"), null);
  const message = parseApplicationMessage(form({ message: "I can shoot this Saturday." }));
  assert.equal("message" in message, true);
});

test("the free plan includes one campaign and a paid plan does not invent payment", () => {
  assert.equal(FREE_CAMPAIGN_LIMIT, 1);
  assert.equal(canCreateCampaign("free", 0), true);
  assert.equal(canCreateCampaign("free", 1), false);
  assert.equal(canCreateCampaign("paid", 4), true);
});
