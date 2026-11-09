import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { createInvoice } from "@/actions/invoices";
import { InvoiceForm } from "@/components/InvoiceForm";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer } = await searchParams;
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("business_id", business.id)
    .is("archived_at", null)
    .order("name");

  if (!customers || customers.length === 0) {
    return (
      <div>
        <Link href="/invoices" className="text-sm text-muted hover:text-body">
          ← Invoices
        </Link>
        <h1 className="mt-2 text-2xl font-medium">New invoice</h1>
        <div className="mt-6 border border-card-line rounded-sm bg-card p-6 max-w-md">
          <p className="text-sm text-muted">
            You&apos;ll need at least one customer before you can create an invoice.
          </p>
          <Link
            href="/customers/new"
            className="mt-4 inline-block bg-btn text-btn-text px-4 py-2 rounded-sm text-sm hover:opacity-90"
          >
            Add a customer
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/invoices" className="text-sm text-muted hover:text-body">
        ← Invoices
      </Link>
      <h1 className="mt-2 text-2xl font-medium">New invoice</h1>
      <p className="mt-1 text-sm text-muted">
        Saves as a draft — you can review and send it from the invoice page.
      </p>

      <div className="mt-6">
        <InvoiceForm
          customers={customers}
          defaults={{
            currency: business.default_currency,
            tax_rate: business.default_tax_rate,
            payment_terms_days: business.default_payment_terms_days,
            notes: business.default_notes,
          }}
          preselectedCustomerId={customer}
          action={createInvoice}
          submitLabel="Save draft"
          cancelHref="/invoices"
        />
      </div>
    </div>
  );
}
