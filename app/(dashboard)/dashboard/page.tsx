import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/invoice-calculations";
import { getEffectiveStatus, type StoredStatus } from "@/lib/invoice-status";

export default async function DashboardPage() {
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_number, status, total, amount_paid, currency, due_date, issue_date, customers(name)")
    .eq("business_id", business.id)
    .order("issue_date", { ascending: false });

  type Row = {
    id: string;
    invoice_number: string;
    status: StoredStatus;
    total: number;
    amount_paid: number;
    currency: string;
    due_date: string | null;
    issue_date: string;
    customers: { name: string } | { name: string }[] | null;
  };
  const invoices = (data ?? []) as Row[];

  const currency = business.default_currency;
  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;
  let overdueAmount = 0;

  for (const inv of invoices) {
    if (inv.status === "cancelled") continue;
    totalInvoiced += Number(inv.total);
    totalPaid += Number(inv.amount_paid);
    const outstanding = Number(inv.total) - Number(inv.amount_paid);
    if (outstanding > 0) {
      totalOutstanding += outstanding;
      if (getEffectiveStatus(inv.status, inv.due_date, inv.amount_paid, inv.total) === "overdue") {
        overdueAmount += outstanding;
      }
    }
  }

  const recentInvoices = invoices.slice(0, 6);

  const { data: recentPaymentsRaw } = await supabase
    .from("payments")
    .select("id, amount, paid_at, invoices(invoice_number, currency, customers(name))")
    .eq("business_id", business.id)
    .order("paid_at", { ascending: false })
    .limit(6);

  type PaymentRow = {
    id: string;
    amount: number;
    paid_at: string;
    invoices:
      | { invoice_number: string; currency: string; customers: { name: string } | { name: string }[] | null }
      | { invoice_number: string; currency: string; customers: { name: string } | { name: string }[] | null }[]
      | null;
  };
  const recentPayments = (recentPaymentsRaw ?? []) as PaymentRow[];

  return (
    <div>
      <h1 className="text-2xl font-medium">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">A quick look at where things stand.</p>

      <div className="mt-6 grid sm:grid-cols-4 gap-4">
        <StatCard label="Total invoiced" value={formatMoney(totalInvoiced, currency)} />
        <StatCard label="Total paid" value={formatMoney(totalPaid, currency)} accent />
        <StatCard label="Outstanding" value={formatMoney(totalOutstanding, currency)} />
        <StatCard label="Overdue" value={formatMoney(overdueAmount, currency)} warn={overdueAmount > 0} />
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium">Recent invoices</h2>
            <Link href="/invoices" className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="border border-border rounded-sm bg-surface divide-y divide-border">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-paper transition-colors text-sm"
                >
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-ink-soft">
                      {Array.isArray(inv.customers) ? inv.customers[0]?.name : inv.customers?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={getEffectiveStatus(inv.status, inv.due_date, inv.amount_paid, inv.total)} />
                    <span className="tabular-nums w-20 text-right">
                      {formatMoney(inv.total, inv.currency)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-sm text-ink-soft">
                No invoices yet.{" "}
                <Link href="/invoices/new" className="text-accent hover:underline">
                  Create your first one
                </Link>
                .
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium mb-3">Recent payments</h2>
          <div className="border border-border rounded-sm bg-surface divide-y divide-border">
            {recentPayments && recentPayments.length > 0 ? (
              recentPayments.map((p) => {
                const inv = Array.isArray(p.invoices) ? p.invoices[0] : p.invoices;
                const customer = inv?.customers
                  ? Array.isArray(inv.customers)
                    ? inv.customers[0]?.name
                    : inv.customers?.name
                  : null;
                return (
                  <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{inv?.invoice_number}</p>
                      <p className="text-xs text-ink-soft">{customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums">{formatMoney(p.amount, inv?.currency ?? currency)}</p>
                      <p className="text-xs text-ink-soft">{p.paid_at}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-ink-soft">No payments recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="border border-border rounded-sm bg-surface p-4">
      <p className="text-xs text-ink-soft">{label}</p>
      <p
        className={`mt-1 text-xl font-serif-display tabular-nums ${
          warn ? "text-danger" : accent ? "text-accent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
