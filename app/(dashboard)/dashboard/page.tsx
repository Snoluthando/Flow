import Link from "next/link";
import { FileText, Wallet, Clock, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { StatusBadge } from "@/components/StatusBadge";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusDonut } from "@/components/dashboard/StatusDonut";
import { formatMoney } from "@/lib/invoice-calculations";
import { getEffectiveStatus } from "@/lib/invoice-status";
import { buildDashboard, pctChange, resolveRange, type DashInvoice, type DashPayment } from "@/lib/dashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const business = await requireBusiness();
  const supabase = await createClient();

  const [invoicesRes, paymentsRes, recentPaymentsRes] = await Promise.all([
    supabase
      .from("invoices")
      .select("id, invoice_number, status, total, amount_paid, currency, due_date, issue_date, customers(name)")
      .eq("business_id", business.id)
      .order("issue_date", { ascending: false }),
    supabase.from("payments").select("amount, paid_at").eq("business_id", business.id),
    supabase
      .from("payments")
      .select("id, amount, paid_at, invoices(invoice_number, currency, customers(name))")
      .eq("business_id", business.id)
      .order("paid_at", { ascending: false })
      .limit(6),
  ]);

  const invoices = (invoicesRes.data ?? []) as DashInvoice[];
  const payments = (paymentsRes.data ?? []) as DashPayment[];

  type PaymentRow = {
    id: string;
    amount: number;
    paid_at: string;
    invoices:
      | { invoice_number: string; currency: string; customers: { name: string } | { name: string }[] | null }
      | { invoice_number: string; currency: string; customers: { name: string } | { name: string }[] | null }[]
      | null;
  };
  const recentPayments = (recentPaymentsRes.data ?? []) as PaymentRow[];

  const currency = business.default_currency;
  const range = resolveRange(params);
  const d = buildDashboard(invoices, payments, range);
  const recentInvoices = invoices.slice(0, 6);

  return (
    <div className="space-y-6">
      <HeroBanner businessName={business.name} topCustomers={d.topCustomers} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-medium">Dashboard</h2>
          <p className="mt-1 text-sm text-muted">{business.name}</p>
        </div>
        <PeriodFilter range={range} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          tone="invoiced"
          label="Total invoiced"
          icon={FileText}
          value={formatMoney(d.invoiced.value, currency)}
          deltaPct={pctChange(d.invoiced.value, d.invoiced.prev)}
          series={d.invoiced.series}
        />
        <KpiCard
          tone="collected"
          label="Collected"
          icon={Wallet}
          value={formatMoney(d.collected.value, currency)}
          deltaPct={pctChange(d.collected.value, d.collected.prev)}
          series={d.collected.series}
        />
        <KpiCard
          tone="outstanding"
          label="Outstanding"
          icon={Clock}
          value={formatMoney(d.outstanding.value, currency)}
          note={`${d.outstanding.count} open ${d.outstanding.count === 1 ? "invoice" : "invoices"} · all time`}
          href="/invoices"
        />
        <KpiCard
          tone="overdue"
          label="Overdue"
          icon={AlertCircle}
          value={formatMoney(d.overdue.value, currency)}
          note={`${d.overdue.count} overdue ${d.overdue.count === 1 ? "invoice" : "invoices"} · all time`}
          href="/invoices"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <RevenueChart
          months={d.months}
          peak={d.peak}
          avg={d.avg}
          currency={currency}
          invoicedValue={d.invoiced.value}
          invoicedPrev={d.invoiced.prev}
        />
        <StatusDonut rows={d.status} total={d.statusTotal} currency={currency} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-card border border-dash-line bg-dash-card p-5 shadow-dash">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent invoices</h2>
            <Link href="/invoices" className="text-sm text-link hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="-mx-2 flex items-center justify-between rounded-lg px-2 py-3 text-sm transition-colors hover:bg-row-hover"
                >
                  <div>
                    <p className="font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-muted">
                      {Array.isArray(inv.customers) ? inv.customers[0]?.name : inv.customers?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={getEffectiveStatus(inv.status, inv.due_date, inv.amount_paid, inv.total)} />
                    <span className="w-24 text-right tabular-nums">{formatMoney(inv.total, inv.currency)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted">
                No invoices yet.{" "}
                <Link href="/invoices/new" className="text-link hover:underline">
                  Create your first one
                </Link>
                .
              </div>
            )}
          </div>
        </section>

        <section className="rounded-card border border-dash-line bg-dash-card p-5 shadow-dash">
          <h2 className="mb-3 text-lg font-medium">Recent payments</h2>
          <div className="divide-y divide-line">
            {recentPayments.length > 0 ? (
              recentPayments.map((p) => {
                const inv = Array.isArray(p.invoices) ? p.invoices[0] : p.invoices;
                const customer = inv?.customers
                  ? Array.isArray(inv.customers)
                    ? inv.customers[0]?.name
                    : inv.customers?.name
                  : null;
                return (
                  <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{inv?.invoice_number}</p>
                      <p className="text-xs text-muted">{customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="tabular-nums">{formatMoney(p.amount, inv?.currency ?? currency)}</p>
                      <p className="text-xs text-muted">{p.paid_at}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-sm text-muted">No payments recorded yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
