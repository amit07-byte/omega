const cityPattern = /^[\p{L}\p{M}\s.'-]{2,80}$/u;
const textPattern = /^[\p{L}\p{M}\p{N}\s.'’&(),:/+-]{2,80}$/u;

function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function limitedText(value: string, min: number, max: number, label: string): string | null {
  if (value.length < min || value.length > max) {
    return `${label} must be ${min}–${max} characters.`;
  }
  return null;
}

export type CreatorProfileInput = {
  displayName: string;
  craft: string;
  bio: string;
  city: string;
  neighborhood: string;
};

export function parseCreatorProfile(
  formData: FormData,
): { data: CreatorProfileInput } | { error: string } {
  const displayName = field(formData, "displayName");
  const craft = field(formData, "craft");
  const bio = field(formData, "bio");
  const city = field(formData, "city");
  const neighborhood = field(formData, "neighborhood");

  if (!textPattern.test(displayName)) {
    return { error: "Enter the name businesses should see." };
  }
  if (craft.length < 2 || craft.length > 40) {
    return { error: "Craft must be 2–40 characters." };
  }
  const bioError = limitedText(bio, 10, 600, "Bio");
  if (bioError) {
    return { error: bioError };
  }
  if (!cityPattern.test(city) || !cityPattern.test(neighborhood)) {
    return { error: "Enter a city and neighborhood." };
  }

  return { data: { displayName, craft, bio, city, neighborhood } };
}

export type CampaignInput = {
  title: string;
  summary: string;
  deliverable: string;
  city: string;
  neighborhood: string;
  publish: boolean;
};

export function parseCampaign(
  formData: FormData,
): { data: CampaignInput } | { error: string } {
  const title = field(formData, "title");
  const summary = field(formData, "summary");
  const deliverable = field(formData, "deliverable");
  const city = field(formData, "city");
  const neighborhood = field(formData, "neighborhood");
  const publish = formData.get("intent") === "publish";

  const titleError = limitedText(title, 4, 80, "Title");
  if (titleError) {
    return { error: titleError };
  }
  const summaryError = limitedText(summary, 10, 600, "Description");
  if (summaryError) {
    return { error: summaryError };
  }
  const deliverableError = limitedText(deliverable, 4, 200, "Deliverable");
  if (deliverableError) {
    return { error: deliverableError };
  }
  if (!cityPattern.test(city) || !cityPattern.test(neighborhood)) {
    return { error: "Enter the city and neighborhood for this campaign." };
  }

  return { data: { title, summary, deliverable, city, neighborhood, publish } };
}

export function parseApplicationMessage(formData: FormData): { message: string } | { error: string } {
  const message = field(formData, "message");
  const messageError = limitedText(message, 10, 600, "Application");
  if (messageError) {
    return { error: messageError };
  }
  return { message };
}

export function parseDecision(value: FormDataEntryValue | null): "accepted" | "rejected" | null {
  return value === "accepted" || value === "rejected" ? value : null;
}
