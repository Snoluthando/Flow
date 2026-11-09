import { formatMoney } from "@/lib/invoice-calculations";
import { niceAxis, pctChange } from "@/lib/dashboard";

type Month = { key: string; label: string; invoiced: number; collected: number };

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export function RevenueChart({
  months,
  peak,
  avg,
  currency,
  invoicedValue,
  invoicedPrev,
}: {
  months: Month[];
  peak: Month;
  avg: number;
  currency: string;
  invoicedValue: number;
  invoicedPrev: number;
}) {
  const axis = niceAxis(Math.max(...months.map((m) => Math.max(m.invoiced, m.collected))));
  const vs = pctChange(invoicedValue, invoicedPrev);
  const hasData = months.some((m) => m.invoiced > 0 || m.collected > 0);

  return (
    <div className="rounded-card border border-dash-line bg-dash-card p-5 shadow-dash">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Monthly sales</h2>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-chart-invoiced" /> Invoiced
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-chart-collected" /> Collected
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        {/* y axis */}
        <div className="flex h-56 flex-col-reverse justify-between pb-0 text-xs tabular-nums text-chart-axis">
          {axis.ticks.map((t) => (
            <span key={t} className="leading-none">{compact.format(t)}</span>
          ))}
        </div>

        <div className="relative h-56 flex-1">
          {/* grid */}
          <div className="absolute inset-0 flex flex-col-reverse justify-between" aria-hidden="true">
            {axis.ticks.map((t) => (
              <div key={t} className="border-t border-dashed border-chart-grid" />
            ))}
          </div>
          {/* bars */}
          <div className="absolute inset-0 flex items-end justify-around gap-2 px-1">
            {months.map((m) => (
              <div
                key={m.key}
                className="flex h-full max-w-14 flex-1 items-end justify-center gap-1"
                title={`${m.label}: invoiced ${formatMoney(m.invoiced, currency)}, collected ${formatMoney(m.collected, currency)}`}
              >
                <div
                  className="w-1/2 rounded-t-md bg-chart-invoiced"
                  style={{ height: `${(m.invoiced / axis.max) * 100}%`, minHeight: m.invoiced > 0 ? 3 : 0 }}
                />
                <div
                  className="w-1/2 rounded-t-md bg-chart-collected"
                  style={{ height: `${(m.collected / axis.max) * 100}%`, minHeight: m.collected > 0 ? 3 : 0 }}
                />
              </div>
            ))}
          </div>
          {!hasData && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-muted">
              No sales in these months yet.
            </p>
          )}
        </div>
      </div>

      {/* x axis */}
      <div className="mt-2 flex gap-3">
        <div className="invisible text-xs">{compact.format(axis.max)}</div>
        <div className="flex flex-1 justify-around gap-2 px-1 text-xs text-chart-axis">
          {months.map((m) => (
            <span key={m.key} className="max-w-14 flex-1 text-center">{m.label}</span>
          ))}
        </div>
      </div>

      {/* summary chips */}
      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
        <span className="rounded-full bg-dash-chip px-3 py-1.5 text-center text-dash-chip-text">
          {vs === null ? "No earlier period to compare" : `${vs >= 0 ? "+" : ""}${vs.toFixed(0)}% vs previous period`}
        </span>
        <span className="rounded-full bg-dash-chip px-3 py-1.5 text-center text-dash-chip-text">
          {hasData ? `Peak: ${peak.label} (${formatMoney(peak.invoiced, currency)})` : "Peak: —"}
        </span>
        <span className="rounded-full bg-dash-chip px-3 py-1.5 text-center text-dash-chip-text">
          Avg: {formatMoney(avg, currency)}/mo
        </span>
      </div>
    </div>
  );
}
