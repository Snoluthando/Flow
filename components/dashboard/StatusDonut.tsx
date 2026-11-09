import { formatMoney } from "@/lib/invoice-calculations";
import type { StatusKey } from "@/lib/dashboard";

type Row = { key: StatusKey; label: string; count: number; amount: number };

const STROKE: Record<StatusKey, string> = {
  paid: "stroke-chart-paid",
  sent: "stroke-chart-sent",
  partially_paid: "stroke-chart-partial",
  overdue: "stroke-chart-overdue",
  draft: "stroke-chart-draft",
};
const DOT: Record<StatusKey, string> = {
  paid: "bg-chart-paid",
  sent: "bg-chart-sent",
  partially_paid: "bg-chart-partial",
  overdue: "bg-chart-overdue",
  draft: "bg-chart-draft",
};

export function StatusDonut({ rows, total, currency }: { rows: Row[]; total: number; currency: string }) {
  const R = 62, C = 2 * Math.PI * R, GAP = total > 1 ? 4 : 0;
  const visible = rows.filter((r) => r.count > 0);
  const segments = visible.map((r, i) => {
    const before = visible.slice(0, i).reduce((sum, x) => sum + x.count, 0);
    const len = (r.count / total) * C;
    return { key: r.key, dash: Math.max(len - GAP, 0.5), offset: (before / total) * C };
  });

  return (
    <div className="rounded-card border border-dash-line bg-dash-card p-5 shadow-dash">
      <h2 className="text-lg font-medium">Invoice status</h2>
      <p className="text-xs text-muted">Invoices issued in this period</p>

      <div className="relative mx-auto mt-4 h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label="Invoices by status">
          <circle cx="80" cy="80" r={R} fill="none" strokeWidth="18" className="stroke-chart-empty" />
          {segments.map((s) => (
            <circle
              key={s.key}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              strokeWidth="18"
              strokeLinecap="butt"
              className={STROKE[s.key]}
              strokeDasharray={`${s.dash} ${C - s.dash}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-medium tabular-nums">{total}</span>
          <span className="text-xs text-muted">{total === 1 ? "invoice" : "invoices"}</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-sm">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${DOT[r.key]}`} />
              {r.label}
            </span>
            <span className="flex items-center gap-3 tabular-nums">
              <span className="text-xs text-muted">{formatMoney(r.amount, currency)}</span>
              <span className="w-6 text-right">{r.count}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
