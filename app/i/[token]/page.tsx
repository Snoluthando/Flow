import { notFound } from "next/navigation";
import { createAnonClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/invoice-calculations";
import { getEffectiveStatus } from "@/lib/invoice-status";

export const dynamic = "force-dynamic";

type PublicInvoiceData = {
  invoice: {
    id: string;
    invoice_number: string;
    status: "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
    currency: string;
    issue_date: string;
    due_date: string | null;
    subtotal: number;
    discount_total: number;
    tax_total: number;
    total: number;
    amount_paid: number;
    notes: string | null;
    public_token: string;
  };
  business: {
    name: string;
    logo_url: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    tax_number: string | null;
    invoice_accent_color: string | null;
  };
  customer: { name: string; email: string | null; address: string | null };
  items: { description: string; quantity: number; unit_price: number; line_total: number }[];
};

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createAnonClient();

  const { data, error } = await supabase.rpc("get_public_invoice", { token });

  if (error || !data || !data.invoice) notFound();

  // Best-effort: mark as viewed. Never blocks rendering if it fails.
  await supabase.rpc("mark_invoice_viewed", { token }).then(
    () => {},
    () => {}
  );

  const { invoice, business, customer, items } = data as PublicInvoiceData;
  const effectiveStatus = getEffectiveStatus(
    invoice.status,
    invoice.due_date,
    invoice.amount_paid,
    invoice.total
  );
  const balanceDue = Math.max(invoice.total - invoice.amount_paid, 0);

  return (
    <div className="min-h-screen bg-page py-12 px-4">
      <div className="mx-auto max-w-2xl bg-card border border-card-line rounded-sm p-8">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            {business.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo_url}
                alt={`${business.name} logo`}
                className="h-12 w-12 object-contain rounded-sm border border-line"
              />
            )}
            <div>
              <h1 className="font-serif-display text-xl">{business.name}</h1>
              {business.address && <p className="text-sm text-muted mt-1">{business.address}</p>}
              {business.email && <p className="text-sm text-muted">{business.email}</p>}
              {business.phone && <p className="text-sm text-muted">{business.phone}</p>}
            </div>
          </div>
          <div className="text-right">
            <p
              className="font-serif-display text-lg"
              style={{ color: business.invoice_accent_color || undefined }}
            >
              {invoice.invoice_number}
            </p>
            <div className="mt-1">
              <StatusBadge status={effectiveStatus} />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8 text-sm">
          <div>
            <p className="text-xs text-muted">Billed to</p>
            <p>{customer.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Issued</p>
            <p>{invoice.issue_date}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Due</p>
            <p>{invoice.due_date ?? "—"}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-table-line">
              <th className="pb-2 font-normal">Description</th>
              <th className="pb-2 font-normal text-right">Qty</th>
              <th className="pb-2 font-normal text-right">Unit price</th>
              <th className="pb-2 font-normal text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-table-line last:border-b-0">
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right tabular-nums">{item.quantity}</td>
                <td className="py-2 text-right tabular-nums">
                  {formatMoney(item.unit_price, invoice.currency)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatMoney(item.line_total, invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto max-w-xs space-y-1.5 text-sm">
          <Row label="Subtotal" value={formatMoney(invoice.subtotal, invoice.currency)} />
          <Row label="Discount" value={`-${formatMoney(invoice.discount_total, invoice.currency)}`} />
          <Row label="Tax" value={formatMoney(invoice.tax_total, invoice.currency)} />
          <div className="border-t border-line pt-1.5 flex justify-between font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(invoice.total, invoice.currency)}</span>
          </div>
          {invoice.amount_paid > 0 && (
            <>
              <Row label="Paid" value={`-${formatMoney(invoice.amount_paid, invoice.currency)}`} />
              <div className="flex justify-between font-medium">
                <span>Balance due</span>
                <span className="tabular-nums">{formatMoney(balanceDue, invoice.currency)}</span>
              </div>
            </>
          )}
        </div>

        {invoice.notes && (
          <div className="mt-6 pt-4 border-t border-line">
            <p className="text-xs text-muted mb-1">Notes</p>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-line flex items-center justify-between">
          <p className="text-xs text-muted">
            {business.tax_number ? `Tax no: ${business.tax_number}` : ""}
          </p>
          <a
            href={`/api/public-invoices/${invoice.public_token}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-sm text-sm text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: business.invoice_accent_color || "#2f6f5e" }}
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
