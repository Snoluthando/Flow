import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { updateInvoice } from "@/actions/invoices";
import { InvoiceForm } from "@/components/InvoiceForm";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, invoice_items(*)")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();

  if (!invoice) notFound();

  // Only drafts can be edited directly — a sent invoice's numbers are what
  // the customer already received, so changes go through a new invoice.
  if (invoice.status !== "draft") {
    redirect(`/invoices/${id}`);
  }

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("business_id", business.id)
    .is("archived_at", null)
    .order("name");

  return (
    <div>
      <Link href={`/invoices/${id}`} className="text-sm text-ink-soft hover:text-ink">
        ← {invoice.invoice_number}
      </Link>
      <h1 className="mt-2 text-2xl font-medium">Edit invoice</h1>

      <div className="mt-6">
        <InvoiceForm
          customers={customers ?? []}
          defaults={{
            currency: business.default_currency,
            tax_rate: business.default_tax_rate,
            payment_terms_days: business.default_payment_terms_days,
            notes: business.default_notes,
          }}
          invoice={invoice}
          action={updateInvoice.bind(null, id)}
          submitLabel="Save changes"
          cancelHref={`/invoices/${id}`}
        />
      </div>
    </div>
  );
}
