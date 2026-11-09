import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { updateCustomer, archiveCustomer } from "@/actions/customers";
import { CustomerForm } from "@/components/CustomerForm";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/invoice-calculations";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();

  if (!customer) notFound();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total, currency, due_date")
    .eq("customer_id", id)
    .order("issue_date", { ascending: false });

  const boundUpdate = updateCustomer.bind(null, id);
  const boundArchive = archiveCustomer.bind(null, id);

  return (
    <div>
      <Link href="/customers" className="text-sm text-muted hover:text-body">
        ← Customers
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-medium">{customer.name}</h1>
        <form action={boundArchive}>
          <button type="submit" className="text-sm text-danger hover:underline">
            Archive customer
          </button>
        </form>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-sm font-medium mb-4">Details</h2>
          <CustomerForm customer={customer} action={boundUpdate} submitLabel="Save changes" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Invoices</h2>
            <Link
              href={`/invoices/new?customer=${customer.id}`}
              className="text-sm text-link hover:underline"
            >
              New invoice
            </Link>
          </div>
          <div className="border border-card-line rounded-sm bg-card divide-y divide-line">
            {invoices && invoices.length > 0 ? (
              invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-row-hover transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{inv.invoice_number}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-sm tabular-nums">{formatMoney(inv.total, inv.currency)}</p>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-muted">
                No invoices for this customer yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
