import Link from "next/link";
import { RANGE_OPTIONS, formatRangeLabel, type DashRange } from "@/lib/dashboard";

export function PeriodFilter({ range }: { range: DashRange }) {
  return (
    <div className="flex flex-col gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-1.5">
        {RANGE_OPTIONS.map((o) => {
          const active = range.key === o.key;
          return (
            <Link
              key={o.key}
              href={`/dashboard?range=${o.key}`}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                active
                  ? "border-tab-active-bg bg-tab-active-bg text-tab-active"
                  : "border-dash-line bg-dash-card text-muted hover:border-btn-outline-hover"
              }`}
            >
              {o.label}
            </Link>
          );
        })}
      </div>

      <form method="get" action="/dashboard" className="flex flex-wrap items-center gap-2 text-xs">
        <input type="hidden" name="range" value="custom" />
        <input
          type="date"
          name="from"
          defaultValue={range.from}
          aria-label="From"
          className="rounded-lg border border-input-line bg-input px-2.5 py-1.5 focus:border-input-focus"
        />
        <span className="text-muted">to</span>
        <input
          type="date"
          name="to"
          defaultValue={range.to}
          aria-label="To"
          className="rounded-lg border border-input-line bg-input px-2.5 py-1.5 focus:border-input-focus"
        />
        <button
          type="submit"
          className="rounded-lg bg-btn px-3 py-1.5 text-btn-text transition-opacity hover:opacity-90"
        >
          Apply
        </button>
      </form>
      <p className="text-xs text-muted">
        {formatRangeLabel(range.from, range.to)} · compared to {formatRangeLabel(range.prevFrom, range.prevTo)}
      </p>
    </div>
  );
}
