export type BusinessProfileInput = {
  businessName: string;
  category: string;
  description: string;
  website: string;
  instagram: string;
  tiktok: string;
  city: string;
  neighborhood: string;
};

export type BusinessProfileRecord = BusinessProfileInput & {
  logoPath: string;
};

type ParseResult =
  | { ok: true; value: BusinessProfileInput }
  | { ok: false; message: string };

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim().replace(/\s+/g, " ");
}

function optionalHandle(
  value: string,
  label: string,
): { ok: false; message: string } | { ok: true; handle: string } {
  const cleaned = value.replace(/^@/, "");
  if (!cleaned) {
    return { ok: true, handle: "" };
  }
  if (cleaned.length > 40 || /\s/.test(cleaned)) {
    return { ok: false, message: `Enter a valid ${label} handle.` };
  }
  return { ok: true, handle: cleaned };
}

export function parseBusinessProfile(formData: FormData): ParseResult {
  const businessName = field(formData, "businessName");
  if (businessName.length < 2 || businessName.length > 80) {
    return { ok: false, message: "Enter a business name between 2 and 80 characters." };
  }

  const category = field(formData, "category");
  if (category.length < 2 || category.length > 40) {
    return { ok: false, message: "Enter a category between 2 and 40 characters." };
  }

  const description = String(formData.get("description") ?? "").trim().replace(/\s+/g, " ");
  if (description.length < 10 || description.length > 600) {
    return { ok: false, message: "Enter a description between 10 and 600 characters." };
  }

  const websiteRaw = String(formData.get("website") ?? "").trim();
  let website = "";
  if (websiteRaw) {
    try {
      const url = new URL(websiteRaw);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return { ok: false, message: "Enter a valid website URL." };
      }
      website = url.toString();
    } catch {
      return { ok: false, message: "Enter a valid website URL." };
    }
  }

  const instagram = optionalHandle(field(formData, "instagram"), "Instagram");
  if (!instagram.ok) {
    return instagram;
  }
  const tiktok = optionalHandle(field(formData, "tiktok"), "TikTok");
  if (!tiktok.ok) {
    return tiktok;
  }

  const city = field(formData, "city");
  if (city.length < 2 || city.length > 80) {
    return { ok: false, message: "Enter a city between 2 and 80 characters." };
  }

  const neighborhood = field(formData, "neighborhood");
  if (neighborhood.length < 2 || neighborhood.length > 80) {
    return { ok: false, message: "Enter a neighborhood between 2 and 80 characters." };
  }

  return {
    ok: true,
    value: {
      businessName,
      category,
      description,
      website,
      instagram: instagram.handle,
      tiktok: tiktok.handle,
      city,
      neighborhood,
    },
  };
}

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function readBusinessProfile(metadata: unknown): BusinessProfileRecord {
  const profile = record(record(metadata)?.business_profile);
  return {
    businessName: text(profile?.name),
    category: text(profile?.category),
    description: text(profile?.description),
    website: text(profile?.website),
    instagram: text(profile?.instagram),
    tiktok: text(profile?.tiktok),
    city: text(profile?.city),
    neighborhood: text(profile?.neighborhood),
    logoPath: text(profile?.logo_path),
  };
}

export function isBusinessProfileComplete(metadata: unknown) {
  const profile = readBusinessProfile(metadata);
  return (
    profile.businessName.length >= 2 &&
    profile.category.length >= 2 &&
    profile.description.length >= 10 &&
    profile.city.length >= 2 &&
    profile.neighborhood.length >= 2
  );
}
