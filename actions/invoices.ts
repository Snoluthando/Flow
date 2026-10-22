"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { invoiceSchema } from "@/lib/validations";
import { calculateInvoiceTotals } from "@/lib/invoice-calculations";

export type FormState = { error?: string } | null;

function parseInvoiceForm(formData: FormData) {
  const itemsRaw = formData.get("items_json");
  let items: unknown = [];
  try {
    items = itemsRaw ? JSON.parse(String(itemsRaw)) : [];
  } catch {
    items = [];
  }

  return invoiceSchema.safeParse({
    customer_id: formData.get("customer_id"),
    currency: formData.get("currency"),
    issue_date: formData.get("issue_date"),
    due_date: formData.get("due_date") || undefined,
    discount_type: formData.get("discount_type"),
    discount_value: formData.get("discount_value") || 0,
    tax_rate: formData.get("tax_rate") || 0,
    notes: formData.get("notes") ?? "",
    items,
  });
}

async function nextInvoiceNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  prefix: string,
  currentNumber: number
) {
  const formatted = `${prefix}${String(currentNumber).padStart(5, "0")}`;
  await supabase
    .from("businesses")
    .update({ next_invoice_number: currentNumber + 1 })
    .eq("id", businessId);
  return formatted;
}

export async function createInvoice(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await requireBusiness();
  const parsed = parseInvoiceForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the invoice details." };
  }

  const { items, ...rest } = parsed.data;
  const totals = calculateInvoiceTotals(items, rest.discount_type, rest.discount_value, rest.tax_rate);

  const supabase = await createClient();
  const invoiceNumber = await nextInvoiceNumber(
    supabase,
    business.id,
    business.invoice_prefix,
    business.next_invoice_number
  );

  // New invoices always start as drafts. "Send invoice" (a separate action)
  // is what moves an invoice to "sent" and emails the customer.
  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      business_id: business.id,
      customer_id: rest.customer_id,
      invoice_number: invoiceNumber,
      status: "draft",
      currency: rest.currency,
      issue_date: rest.issue_date,
      due_date: rest.due_date || null,
      discount_type: rest.discount_type,
      discount_value: rest.discount_value,
      tax_rate: rest.tax_rate,
      notes: rest.notes || null,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      tax_total: totals.taxTotal,
      total: totals.total,
    })
    .select("id")
    .single();

  if (error || !invoice) {
    return { error: "We couldn't create the invoice. Please try again." };
  }

  const { error: itemsError } = await supabase.from("invoice_items").insert(
    items.map((item, index) => ({
      invoice_id: invoice.id,
      position: index,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: Math.round(item.quantity * item.unit_price * 100) / 100,
    }))
  );

  if (itemsError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return { error: "We couldn't save the invoice line items. Please try again." };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoice.id}`);
}

export async function updateInvoice(
  invoiceId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const business = await requireBusiness();
  const parsed = parseInvoiceForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the invoice details." };
  }

  const { items, ...rest } = parsed.data;
  const totals = calculateInvoiceTotals(items, rest.discount_type, rest.discount_value, rest.tax_rate);

  const supabase = await createClient();

  const { error } = await supabase
    .from("invoices")
    .update({
      customer_id: rest.customer_id,
      currency: rest.currency,
      issue_date: rest.issue_date,
      due_date: rest.due_date || null,
      discount_type: rest.discount_type,
      discount_value: rest.discount_value,
      tax_rate: rest.tax_rate,
      notes: rest.notes || null,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      tax_total: totals.taxTotal,
      total: totals.total,
    })
    .eq("id", invoiceId)
    .eq("business_id", business.id);

  if (error) {
    return { error: "We couldn't save your changes. Please try again." };
  }

  await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
  const { error: itemsError } = await supabase.from("invoice_items").insert(
    items.map((item, index) => ({
      invoice_id: invoiceId,
      position: index,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: Math.round(item.quantity * item.unit_price * 100) / 100,
    }))
  );

  if (itemsError) {
    return { error: "We couldn't save the invoice line items. Please try again." };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  redirect(`/invoices/${invoiceId}`);
}

export async function duplicateInvoice(invoiceId: string) {
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: original } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", invoiceId)
    .eq("business_id", business.id)
    .single();

  if (!original) return;

  const invoiceNumber = await nextInvoiceNumber(
    supabase,
    business.id,
    business.invoice_prefix,
    business.next_invoice_number
  );

  const { data: copy, error } = await supabase
    .from("invoices")
    .insert({
      business_id: business.id,
      customer_id: original.customer_id,
      invoice_number: invoiceNumber,
      status: "draft",
      currency: original.currency,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: null,
      discount_type: original.discount_type,
      discount_value: original.discount_value,
      tax_rate: original.tax_rate,
      notes: original.notes,
      subtotal: original.subtotal,
      discount_total: original.discount_total,
      tax_total: original.tax_total,
      total: original.total,
    })
    .select("id")
    .single();

  if (error || !copy) return;

  type Item = { position: number; description: string; quantity: number; unit_price: number; line_total: number };
  const items = (original.invoice_items as Item[]) ?? [];
  if (items.length > 0) {
    await supabase.from("invoice_items").insert(
      items.map((item) => ({
        invoice_id: copy.id,
        position: item.position,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      }))
    );
  }

  revalidatePath("/invoices");
  redirect(`/invoices/${copy.id}`);
}

export async function deleteInvoice(invoiceId: string) {
  const business = await requireBusiness();
  const supabase = await createClient();
  await supabase.from("invoices").delete().eq("id", invoiceId).eq("business_id", business.id);
  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function cancelInvoice(invoiceId: string) {
  const business = await requireBusiness();
  const supabase = await createClient();
  await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", invoiceId)
    .eq("business_id", business.id);
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
}
