import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/invoice-calculations";
import { getEffectiveStatus } from "@/lib/invoice-status";
import { SendInvoiceButton } from "@/components/SendInvoiceButton";
import { PaymentForm } from "@/components/PaymentForm";
import { duplicateInvoice, deleteInvoice, cancelInvoice } from "@/actions/invoices";
import { deletePayment } from "@/actions/payments";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(id, name, email, address), invoice_items(*), payments(*)")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();

  if (!invoice) notFound();

  const effectiveStatus = getEffectiveStatus(
    invoice.status,
    invoice.due_date,
    invoice.amount_paid,
    invoice.total
  );
  const items = [...invoice.invoice_items].sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  );
  const payments = [...invoice.payments].sort(
    (a: { paid_at: string }, b: { paid_at: string }) => (a.paid_at < b.paid_at ? 1 : -1)
  );
  const balanceDue = Math.max(invoice.total - invoice.amount_paid, 0);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const publicUrl = `${siteUrl}/i/${invoice.public_token}`;

  const boundDuplicate = duplicateInvoice.bind(null, invoice.id);
  const boundDelete = deleteInvoice.bind(null, invoice.id);
  const boundCancel = cancelInvoice.bind(null, invoice.id);

  return (
    <div>
      <Link href="/invoices" className="text-sm text-muted hover:text-body">
        ← Invoices
      </Link>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium font-serif-display">{invoice.invoice_number}</h1>
            <StatusBadge status={effectiveStatus} />
          </div>
          <p className="mt-1 text-sm text-muted">
            <Link href={`/customers/${invoice.customers.id}`} className="hover:underline">
              {invoice.customers.name}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {invoice.status === "draft" && (
            <Link
              href={`/invoices/${invoice.id}/edit`}
              className="border border-btn-outline px-3 py-1.5 rounded-sm hover:border-btn-outline-hover"
            >
              Edit
            </Link>
          )}
          <a
            href={`/api/invoices/${invoice.id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="border border-btn-outline px-3 py-1.5 rounded-sm hover:border-btn-outline-hover"
          >
            View PDF
          </a>
          <form action={boundDuplicate}>
            <button type="submit" className="border border-btn-outline px-3 py-1.5 rounded-sm hover:border-btn-outline-hover">
              Duplicate
            </button>
          </form>
          {invoice.status === "draft" ? (
            <form action={boundDelete}>
              <button type="submit" className="text-danger hover:underline px-1">
                Delete
              </button>
            </form>
          ) : invoice.status !== "cancelled" && invoice.status !== "paid" ? (
            <form action={boundCancel}>
              <button type="submit" className="text-danger hover:underline px-1">
                Cancel
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_280px] gap-8">
        <div className="border border-card-line rounded-sm bg-card p-6">
          <div className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
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
              {items.map((item: { id: string; description: string; quantity: number; unit_price: number; line_total: number }) => (
                <tr key={item.id} className="border-b border-table-line last:border-b-0">
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
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatMoney(invoice.subtotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Discount</span>
              <span className="tabular-nums">-{formatMoney(invoice.discount_total, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Tax</span>
              <span className="tabular-nums">{formatMoney(invoice.tax_total, invoice.currency)}</span>
            </div>
            <div className="border-t border-line pt-1.5 flex justify-between font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatMoney(invoice.total, invoice.currency)}</span>
            </div>
            {invoice.amount_paid > 0 && (
              <>
                <div className="flex justify-between text-success">
                  <span>Paid</span>
                  <span className="tabular-nums">-{formatMoney(invoice.amount_paid, invoice.currency)}</span>
                </div>
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
        </div>

        <div className="space-y-6">
          {invoice.status === "draft" && (
            <div className="border border-card-line rounded-sm bg-card p-4">
              <h2 className="text-sm font-medium mb-3">Send this invoice</h2>
              <SendInvoiceButton invoiceId={invoice.id} hasEmail={!!invoice.customers.email} />
            </div>
          )}

          {invoice.status !== "draft" && invoice.status !== "cancelled" && (
            <div className="border border-card-line rounded-sm bg-card p-4">
              <h2 className="text-sm font-medium mb-3">Public link</h2>
              <p className="text-xs text-muted break-all">{publicUrl}</p>
            </div>
          )}

          {invoice.status !== "draft" && invoice.status !== "cancelled" && balanceDue > 0 && (
            <div className="border border-card-line rounded-sm bg-card p-4">
              <h2 className="text-sm font-medium mb-3">Record a payment</h2>
              <PaymentForm invoiceId={invoice.id} />
            </div>
          )}

          {payments.length > 0 && (
            <div className="border border-card-line rounded-sm bg-card p-4">
              <h2 className="text-sm font-medium mb-3">Payment history</h2>
              <div className="space-y-2">
                {payments.map((p: { id: string; amount: number; paid_at: string; reference: string | null }) => {
                  const boundDeletePayment = deletePayment.bind(null, p.id, invoice.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="tabular-nums">{formatMoney(p.amount, invoice.currency)}</p>
                        <p className="text-xs text-muted">
                          {p.paid_at} {p.reference ? `· ${p.reference}` : ""}
                        </p>
                      </div>
                      <form action={boundDeletePayment}>
                        <button type="submit" className="text-xs text-danger hover:underline">
                          Remove
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
