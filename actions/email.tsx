"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { InvoicePdf } from "@/lib/pdf/InvoicePdf";
import { formatMoney } from "@/lib/invoice-calculations";
import { sendInvoiceEmail } from "@/lib/email";

export type SendState = { error?: string; success?: boolean } | null;

export async function sendInvoice(invoiceId: string): Promise<SendState>;
export async function sendInvoice(
  invoiceId: string,
  prevState: SendState,
  formData: FormData
): Promise<SendState>;
export async function sendInvoice(invoiceId: string): Promise<SendState> {
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(name, email, address), invoice_items(*)")
    .eq("id", invoiceId)
    .eq("business_id", business.id)
    .single();

  if (!invoice) {
    return { error: "Invoice not found." };
  }

  if (!invoice.customers?.email) {
    return { error: "This customer doesn't have an email address on file." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicUrl = `${siteUrl}/i/${invoice.public_token}`;

  try {
    const pdfBuffer = await renderToBuffer(
      <InvoicePdf
        invoice={invoice}
        business={business}
        customer={invoice.customers}
        items={(invoice.invoice_items ?? []).sort(
          (a: { position: number }, b: { position: number }) => a.position - b.position
        )}
      />
    );

    const subject = await sendInvoiceEmail({
      to: invoice.customers.email,
      businessName: business.name || "Your business",
      invoiceNumber: invoice.invoice_number,
      amount: formatMoney(invoice.total, invoice.currency),
      dueDate: invoice.due_date,
      publicUrl,
      pdfBuffer,
    });

    await supabase.from("email_logs").insert({
      invoice_id: invoice.id,
      business_id: business.id,
      to_email: invoice.customers.email,
      subject,
      status: "sent",
    });

    await supabase
      .from("invoices")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", invoice.id);
  } catch (err) {
    await supabase.from("email_logs").insert({
      invoice_id: invoice.id,
      business_id: business.id,
      to_email: invoice.customers.email,
      subject: `Invoice ${invoice.invoice_number}`,
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return { error: "We couldn't send the invoice. Please try again." };
  }

  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true };
}
