import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  registration_number: string | null;
  tax_number: string | null;
  default_currency: string;
  default_tax_rate: number;
  default_payment_terms_days: number;
  default_notes: string | null;
  invoice_prefix: string;
  next_invoice_number: number;
  invoice_accent_color: string;
};

/**
 * Every authenticated user has exactly one business row (MVP scope — see
 * "Future Expansion" for multi-business support). Creates it on first call
 * so the rest of the app never has to handle a "no business yet" state.
 */
export async function requireBusiness(): Promise<Business> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) return existing as Business;

  const { data: created, error } = await supabase
    .from("businesses")
    .insert({ owner_id: user.id, name: "", email: user.email })
    .select("*")
    .single();

  if (error || !created) {
    console.error("requireBusiness insert failed:", error);
    throw new Error(
      `Could not set up your business profile: ${error?.message ?? "unknown error"} (code: ${error?.code ?? "n/a"})`
    );
  }

  return created as Business;
}

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
}
