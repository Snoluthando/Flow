"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { customerSchema } from "@/lib/validations";

export type FormState = { error?: string } | null;

function parseCustomer(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createCustomer(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness();
  const parsed = parseCustomer(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({ ...parsed.data, business_id: business.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "We couldn't save this customer. Please try again." };
  }

  revalidatePath("/customers");
  redirect(`/customers/${data.id}`);
}

export async function updateCustomer(
  customerId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const business = await requireBusiness();
  const parsed = parseCustomer(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update(parsed.data)
    .eq("id", customerId)
    .eq("business_id", business.id);

  if (error) {
    return { error: "We couldn't save this customer. Please try again." };
  }

  revalidatePath("/customers");
  revalidatePath(`/customers/${customerId}`);
  return { error: undefined };
}

export async function archiveCustomer(customerId: string) {
  const business = await requireBusiness();
  const supabase = await createClient();

  await supabase
    .from("customers")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", customerId)
    .eq("business_id", business.id);

  revalidatePath("/customers");
  redirect("/customers");
}
