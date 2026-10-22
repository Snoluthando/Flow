import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney } from "@/lib/invoice-calculations";
import { getEffectiveStatus, type StoredStatus } from "@/lib/invoice-status";

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Partially paid", value: "partially_paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const business = await requireBusiness();
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(
      "id, invoice_number, status, total, currency, due_date, issue_date, amount_paid, customers(name)"
    )
    .eq("business_id", business.id)
    .order("issue_date", { ascending: false });

  if (q) {
    query = query.ilike("invoice_number", `%${q}%`);
  }

  const { data } = await query;
  type Row = {
    id: string;
    invoice_number: string;
    status: StoredStatus;
    total: number;
    currency: string;
    due_date: string | null;
    issue_date: string;
    amount_paid: number;
    customers: { name: string } | { name: string }[] | null;
  };
  const rows = (data ?? []) as Row[];

  const withEffectiveStatus = rows.map((inv) => ({
    ...inv,
    effectiveStatus: getEffectiveStatus(inv.status, inv.due_date, inv.amount_paid, inv.total),
    customerName: Array.isArray(inv.customers) ? inv.customers[0]?.name : inv.customers?.name,
  }));

  const filtered = status
    ? withEffectiveStatus.filter((inv) => inv.effectiveStatus === status)
    : withEffectiveStatus;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Invoices</h1>
          <p className="mt-1 text-sm text-ink-soft">Everything you&apos;ve billed, in one place.</p>
        </div>
        <Link
          href="/invoices/new"
          className="bg-accent text-white px-4 py-2 rounded-sm text-sm hover:opacity-90"
        >
          New invoice
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
        <form method="get" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search invoice number…"
            className="border border-border rounded-sm px-3 py-2 bg-surface focus:border-accent text-sm w-56"
          />
        </form>
        <div className="flex gap-1 text-sm">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value ? `/invoices?status=${f.value}` : "/invoices"}
              className={`px-2.5 py-1 rounded-sm ${
                (status ?? "") === f.value
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-paper"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 border border-border rounded-sm bg-surface divide-y divide-border">
        {filtered.length > 0 ? (
          filtered.map((inv) => (
            <Link
              key={inv.id}
              href={`/invoices/${inv.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-paper transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-28">{inv.invoice_number}</span>
                <span className="text-sm text-ink-soft">{inv.customerName ?? "—"}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-ink-soft">
                  {inv.due_date ? `Due ${inv.due_date}` : "No due date"}
                </span>
                <StatusBadge status={inv.effectiveStatus} />
                <span className="text-sm tabular-nums w-24 text-right">
                  {formatMoney(inv.total, inv.currency)}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-ink-soft">
            No invoices match yet.
          </div>
        )}
      </div>
    </div>
  );
}
