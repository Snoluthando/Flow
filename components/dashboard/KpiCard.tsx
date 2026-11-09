import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Sparkline } from "./Sparkline";

type Tone = "invoiced" | "collected" | "outstanding" | "overdue";

const ICON_STYLE: Record<Tone, string> = {
  invoiced: "bg-stat-invoiced-bg text-stat-invoiced",
  collected: "bg-stat-collected-bg text-stat-collected",
  outstanding: "bg-stat-outstanding-bg text-stat-outstanding",
  overdue: "bg-stat-overdue-bg text-stat-overdue",
};
const SPARK_STYLE: Record<string, string> = {
  invoiced: "text-spark-invoiced",
  collected: "text-spark-collected",
};

export function KpiCard({
  tone,
  label,
  icon: Icon,
  value,
  deltaPct,
  goodWhenUp = true,
  series,
  note,
  href,
}: {
  tone: Tone;
  label: string;
  icon: LucideIcon;
  value: string;
  /** % change vs previous period; null = nothing to compare against */
  deltaPct?: number | null;
  goodWhenUp?: boolean;
  series?: number[] | null;
  /** shown instead of a delta (for snapshot numbers) */
  note?: string;
  href?: string;
}) {
  let delta: React.ReactNode = null;
  if (deltaPct !== undefined) {
    if (deltaPct === null) {
      delta = <span className="text-delta-neutral">No earlier data to compare</span>;
    } else {
      const up = deltaPct >= 0;
      const good = up === goodWhenUp;
      delta = (
        <span className={good ? "text-delta-good" : "text-delta-bad"}>
          {up ? "+" : ""}
          {deltaPct.toFixed(0)}% vs previous period
        </span>
      );
    }
  }

  return (
    <div className="relative overflow-hidden rounded-card border border-dash-line bg-dash-card p-5 shadow-dash">
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${ICON_STYLE[tone]}`}>
          <Icon size={18} />
        </span>
        <p className="text-sm text-muted">{label}</p>
      </div>
      <p className="mt-4 text-2xl font-medium tabular-nums">{value}</p>
      <p className="relative z-10 mt-3 text-xs">
        {delta}
        {note && (href ? (
          <Link href={href} className="text-muted hover:text-body hover:underline">{note}</Link>
        ) : (
          <span className="text-muted">{note}</span>
        ))}
      </p>
      {series && SPARK_STYLE[tone] && (
        <Sparkline
          values={series}
          id={`spark-${tone}`}
          className={`pointer-events-none absolute bottom-0 right-0 h-12 w-1/2 ${SPARK_STYLE[tone]}`}
        />
      )}
    </div>
  );
}
