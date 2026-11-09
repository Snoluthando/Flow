"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { businessSchema } from "@/lib/validations";

export type FormState = { error?: string; success?: boolean } | null;

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

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
  const update: Record<string, unknown> = { ...parsed.data };

  const logoFile = formData.get("logo");
  const removeLogo = formData.get("remove_logo") === "1";

  if (removeLogo) {
    update.logo_url = null;
  } else if (logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > MAX_LOGO_BYTES) {
      return { error: "Logo must be smaller than 2MB." };
    }
    if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
      return { error: "Logo must be a PNG, JPEG, WebP or SVG image." };
    }

    const extension = logoFile.name.split(".").pop() || "png";
    const path = `${business.owner_id}/logo.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("business-logos")
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type });

    if (uploadError) {
      return { error: `We couldn't upload your logo: ${uploadError.message}` };
    }

    const { data: publicUrlData } = supabase.storage.from("business-logos").getPublicUrl(path);
    // Cache-bust so the new logo shows immediately instead of a stale CDN copy.
    update.logo_url = `${publicUrlData.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabase.from("businesses").update(update).eq("id", business.id);

  if (error) {
    return { error: "We couldn't save your business settings. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
