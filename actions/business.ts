"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { businessSchema } from "@/lib/validations";

export type FormState = { error?: string; success?: boolean } | null;

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function updateBusiness(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness();

  const parsed = businessSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    registration_number: formData.get("registration_number") ?? "",
    tax_number: formData.get("tax_number") ?? "",
    default_currency: formData.get("default_currency"),
    default_tax_rate: formData.get("default_tax_rate") || 0,
    default_payment_terms_days: formData.get("default_payment_terms_days") || 14,
    default_notes: formData.get("default_notes") ?? "",
    invoice_prefix: formData.get("invoice_prefix") || "INV-",
    invoice_accent_color: formData.get("invoice_accent_color") || "#2f6f5e",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired. Please log in again." };
  }

  const updateData: Record<string, unknown> = { ...parsed.data };

  const removeLogo = formData.get("remove_logo") === "1";
  const logoFile = formData.get("logo");

  if (removeLogo && business.logo_url) {
    const existingPath = extractStoragePath(business.logo_url, user.id);
    if (existingPath) {
      await supabase.storage.from("business-logos").remove([existingPath]);
    }
    updateData.logo_url = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { error: "Logo must be smaller than 2MB." };
    }
    const ext = ALLOWED_LOGO_TYPES[logoFile.type];
    if (!ext) {
      return { error: "Logo must be a PNG, JPEG, WebP or SVG file." };
    }

    // Clear any previous logo first (extension may differ from the new one,
    // and we don't want orphaned files accumulating in the bucket).
    const { data: existingFiles } = await supabase.storage.from("business-logos").list(user.id);
    if (existingFiles?.length) {
      await supabase.storage
        .from("business-logos")
        .remove(existingFiles.map((f) => `${user.id}/${f.name}`));
    }

    // Timestamped filename so the public URL changes and browsers/CDNs
    // don't serve a stale cached logo after an update.
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("business-logos")
      .upload(path, logoFile, { contentType: logoFile.type });

    if (uploadError) {
      return { error: "We couldn't upload your logo. Please try again." };
    }

    const { data: publicUrlData } = supabase.storage.from("business-logos").getPublicUrl(path);
    updateData.logo_url = publicUrlData.publicUrl;
  }

  const { error } = await supabase.from("businesses").update(updateData).eq("id", business.id);

  if (error) {
    return { error: "We couldn't save your business settings. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

function extractStoragePath(publicUrl: string, ownerId: string): string | null {
  const marker = "/business-logos/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const path = publicUrl.slice(idx + marker.length);
  return path.startsWith(`${ownerId}/`) ? path : null;
}