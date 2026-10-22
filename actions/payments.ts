"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { paymentSchema } from "@/lib/validations";
import { round2 } from "@/lib/invoice-calculations";

export type FormState = { error?: string } | null;

export async function recordPayment(
  invoiceId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const business = await requireBusiness();

  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    paid_at: formData.get("paid_at"),
    provider: formData.get("provider") || "manual",
    reference: formData.get("reference") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the payment details." };
  }

  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, total, amount_paid")
    .eq("id", invoiceId)
    .eq("business_id", business.id)
    .single();

  if (!invoice) {
    return { error: "Invoice not found." };
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    invoice_id: invoiceId,
    business_id: business.id,
    amount: parsed.data.amount,
    paid_at: parsed.data.paid_at,
    provider: parsed.data.provider,
    reference: parsed.data.reference || null,
    notes: parsed.data.notes || null,
  });

  if (paymentError) {
    return { error: "We couldn't record this payment. Please try again." };
  }

  const newAmountPaid = round2(Number(invoice.amount_paid) + parsed.data.amount);
  const isFullyPaid = newAmountPaid >= Number(invoice.total);

  await supabase
    .from("invoices")
    .update({
      amount_paid: newAmountPaid,
      status: isFullyPaid ? "paid" : undefined,
    })
    .eq("id", invoiceId);

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { error: undefined };
}

export async function deletePayment(paymentId: string, invoiceId: string) {
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("amount")
    .eq("id", paymentId)
    .eq("business_id", business.id)
    .single();

  if (!payment) return;

  await supabase.from("payments").delete().eq("id", paymentId).eq("business_id", business.id);

  const { data: invoice } = await supabase
    .from("invoices")
    .select("total, amount_paid")
    .eq("id", invoiceId)
    .single();

  if (invoice) {
    const newAmountPaid = round2(Number(invoice.amount_paid) - Number(payment.amount));
    const status = newAmountPaid >= Number(invoice.total) ? "paid" : "sent";
    await supabase
      .from("invoices")
      .update({ amount_paid: Math.max(newAmountPaid, 0), status })
      .eq("id", invoiceId);
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}
