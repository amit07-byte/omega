"use server";

import { redirect } from "next/navigation";
import {
  parseBusinessProfile,
  readBusinessProfile,
  type BusinessProfileInput,
} from "@/lib/auth/business-profile";
import { isAccountRole } from "@/lib/auth/credentials";
import { createClient } from "@/lib/supabase/server";

const logoTypes = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
]);

function redirectWith(message: string): never {
  const params = new URLSearchParams();
  params.set("error", message.replace(/[\r\n]+/g, " ").slice(0, 240));
  redirect(`/business/onboarding?${params.toString()}`);
}

function profileData(value: BusinessProfileInput, logoPath: string) {
  return {
    name: value.businessName,
    category: value.category,
    description: value.description,
    website: value.website,
    instagram: value.instagram,
    tiktok: value.tiktok,
    city: value.city,
    neighborhood: value.neighborhood,
    logo_path: logoPath,
  };
}

export async function saveBusinessProfile(formData: FormData) {
  const parsed = parseBusinessProfile(formData);
  if (!parsed.ok) {
    redirectWith(parsed.message);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login");
  }

  const role = data.user.user_metadata?.role;
  if (isAccountRole(role) && role !== "business") {
    redirect("/creator/onboarding");
  }

  const logo = formData.get("logo");
  const logoPath = readBusinessProfile(data.user.user_metadata).logoPath;
  let nextLogoPath = logoPath;
  if (logo instanceof File && logo.size > 0) {
    const extension = logoTypes.get(logo.type);
    if (!extension || logo.size > 1024 * 1024) {
      redirectWith("Upload a PNG, JPEG, or WebP logo up to 1 MB.");
    }
    nextLogoPath = `${data.user.id}/logo.${extension}`;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ display_name: parsed.value.businessName })
    .eq("id", data.user.id);
  if (profileError) {
    redirectWith(profileError.message);
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      display_name: parsed.value.businessName,
      business_profile: profileData(parsed.value, logoPath),
    },
  });
  if (updateError) {
    redirectWith(updateError.message);
  }

  if (logo instanceof File && logo.size > 0 && nextLogoPath !== logoPath) {
    const { error: uploadError } = await supabase.storage.from("logos").upload(nextLogoPath, logo, {
      upsert: true,
      contentType: logo.type,
    });
    if (uploadError) {
      redirectWith("The business profile was saved, but the logo could not be uploaded.");
    }
    const { error: logoUpdateError } = await supabase.auth.updateUser({
      data: {
        business_profile: profileData(parsed.value, nextLogoPath),
      },
    });
    if (logoUpdateError) {
      redirectWith(logoUpdateError.message);
    }
  }

  redirect("/account");
}
