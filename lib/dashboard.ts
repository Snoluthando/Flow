import { getEffectiveStatus, type StoredStatus } from "@/lib/invoice-status";

export type DashInvoice = {
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
export type DashPayment = { amount: number; paid_at: string };

export type RangeKey = "month" | "last-month" | "quarter" | "year" | "custom";
export const RANGE_OPTIONS: { key: Exclude<RangeKey, "custom">; label: string }[] = [
  { key: "month", label: "This month" },
  { key: "last-month", label: "Last month" },
  { key: "quarter", label: "3 months" },
  { key: "year", label: "This year" },
];

const DAY = 86_400_000;
const parse = (d: string) => {
  const [y, m, dd] = d.split("-").map(Number);
  return Date.UTC(y, m - 1, dd);
};
const fmt = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const monthStart = (ms: number, offset = 0) => {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1);
};
const monthEnd = (ms: number) => {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0);
};
const monthsBetween = (a: number, b: number) => {
  const x = new Date(a), y = new Date(b);
  return (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + y.getUTCMonth() - x.getUTCMonth() + 1;
};
const isDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parse(s));

export type DashRange = {
  key: RangeKey;
  from: string;
  to: string;
  /** end of the period actually elapsed (never in the future) */
  curTo: string;
  prevFrom: string;
  prevTo: string;
};

export function resolveRange(
  params: { range?: string; from?: string; to?: string },
  todayStr: string = fmt(Date.now())
): DashRange {
  const today = parse(todayStr);
  let key = (params.range ?? "month") as RangeKey;
  let from: number, to: number;

  if (key === "custom" && isDate(params.from) && isDate(params.to) && parse(params.from!) <= parse(params.to!)) {
    from = parse(params.from!);
    to = parse(params.to!);
  } else {
    if (key === "custom" || !RANGE_OPTIONS.some((o) => o.key === key)) key = "month";
    if (key === "last-month") {
      from = monthStart(today, -1);
      to = monthEnd(from);
    } else if (key === "quarter") {
      from = monthStart(today, -2);
      to = monthEnd(today);
    } else if (key === "year") {
      const y = new Date(today).getUTCFullYear();
      from = Date.UTC(y, 0, 1);
      to = Date.UTC(y, 11, 31);
    } else {
      from = monthStart(today);
      to = monthEnd(today);
    }
  }

  const curTo = Math.max(Math.min(to, today), from);
  const len = Math.round((curTo - from) / DAY) + 1;
  const aligned = new Date(from).getUTCDate() === 1 && to === monthEnd(to);

  let prevFrom: number, prevTo: number;
  if (aligned) {
    prevFrom = monthStart(from, -monthsBetween(from, to));
    prevTo = Math.min(prevFrom + (len - 1) * DAY, from - DAY);
  } else {
    prevTo = from - DAY;
    prevFrom = prevTo - (len - 1) * DAY;
  }
  return { key, from: fmt(from), to: fmt(to), curTo: fmt(curTo), prevFrom: fmt(prevFrom), prevTo: fmt(prevTo) };
}

const inRange = (d: string, a: string, b: string) => d >= a && d <= b;
export const pctChange = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
const customerName = (c: DashInvoice["customers"]) => (Array.isArray(c) ? c[0]?.name : c?.name) ?? "";

export type StatusKey = "paid" | "sent" | "partially_paid" | "overdue" | "draft";
export const STATUS_ORDER: { key: StatusKey; label: string }[] = [
  { key: "paid", label: "Paid" },
  { key: "sent", label: "Sent" },
  { key: "partially_paid", label: "Partial" },
  { key: "overdue", label: "Overdue" },
  { key: "draft", label: "Draft" },
];

function bucketSeries(
  items: { date: string; value: number }[],
  from: string,
  curTo: string
): number[] | null {
  const len = Math.round((parse(curTo) - parse(from)) / DAY) + 1;
  const n = Math.min(12, len);
  if (n < 2) return null;
  const out = new Array(n).fill(0);
  for (const it of items) {
    if (!inRange(it.date, from, curTo)) continue;
    const idx = Math.min(n - 1, Math.floor(((parse(it.date) - parse(from)) / DAY) * (n / len)));
    out[idx] += it.value;
  }
  return out;
}

export function buildDashboard(invoices: DashInvoice[], payments: DashPayment[], range: DashRange, todayStr = fmt(Date.now())) {
  const live = invoices.filter((i) => i.status !== "cancelled");
  const { from, curTo, prevFrom, prevTo } = range;

  const sumInvoiced = (a: string, b: string) =>
    live.filter((i) => inRange(i.issue_date, a, b)).reduce((s, i) => s + Number(i.total), 0);
  const sumCollected = (a: string, b: string) =>
    payments.filter((p) => inRange(p.paid_at, a, b)).reduce((s, p) => s + Number(p.amount), 0);

  const invoiced = {
    value: sumInvoiced(from, curTo),
    prev: sumInvoiced(prevFrom, prevTo),
    series: bucketSeries(live.map((i) => ({ date: i.issue_date, value: Number(i.total) })), from, curTo),
  };
  const collected = {
    value: sumCollected(from, curTo),
    prev: sumCollected(prevFrom, prevTo),
    series: bucketSeries(payments.map((p) => ({ date: p.paid_at, value: Number(p.amount) })), from, curTo),
  };

  // Snapshot numbers (as of today, not limited to the selected period)
  let outstanding = 0, outstandingCount = 0, overdue = 0, overdueCount = 0;
  for (const inv of live) {
    const open = Number(inv.total) - Number(inv.amount_paid);
    if (open <= 0) continue;
    outstanding += open;
    outstandingCount++;
    if (getEffectiveStatus(inv.status, inv.due_date, inv.amount_paid, inv.total) === "overdue") {
      overdue += open;
      overdueCount++;
    }
  }

  // Status breakdown for invoices issued in the period
  const status = STATUS_ORDER.map((s) => ({ ...s, count: 0, amount: 0 }));
  for (const inv of live.filter((i) => inRange(i.issue_date, from, curTo))) {
    const eff = getEffectiveStatus(inv.status, inv.due_date, inv.amount_paid, inv.total);
    const key: StatusKey = eff === "viewed" ? "sent" : (eff as StatusKey);
    const row = status.find((s) => s.key === key);
    if (!row) continue;
    row.count++;
    row.amount += Number(inv.total);
  }

  // Top customers in the period
  const byCustomer = new Map<string, number>();
  for (const inv of live.filter((i) => inRange(i.issue_date, from, curTo))) {
    const name = customerName(inv.customers);
    if (name) byCustomer.set(name, (byCustomer.get(name) ?? 0) + Number(inv.total));
  }
  const topCustomers = [...byCustomer.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, total]) => ({ name, total }));

  // Monthly chart: months touched by the period, padded back to at least 6, max 12
  const endM = monthStart(parse(curTo));
  let startM = Math.min(monthStart(parse(from)), monthStart(endM, -5));
  startM = Math.max(startM, monthStart(endM, -11));
  const months: { key: string; label: string; invoiced: number; collected: number }[] = [];
  for (let m = startM; m <= endM; m = monthStart(m, 1)) {
    const a = fmt(m), b = fmt(monthEnd(m));
    months.push({
      key: a.slice(0, 7),
      label: new Date(m).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      invoiced: sumInvoiced(a, b),
      collected: sumCollected(a, b),
    });
  }
  const peak = months.reduce((best, m) => (m.invoiced > best.invoiced ? m : best), months[0]);
  const avg = months.reduce((s, m) => s + m.invoiced, 0) / (months.length || 1);

  return {
    today: todayStr,
    invoiced,
    collected,
    outstanding: { value: outstanding, count: outstandingCount },
    overdue: { value: overdue, count: overdueCount },
    status,
    statusTotal: status.reduce((s, r) => s + r.count, 0),
    topCustomers,
    months,
    peak,
    avg,
  };
}

/** Pick a "nice" tick size so the axis max sits just above the data. */
export function niceAxis(max: number) {
  if (max <= 0) return { max: 4, ticks: [0, 1, 2, 3, 4] };
  const raw = max / 4;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / pow;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * pow;
  return { max: step * 4, ticks: [0, 1, 2, 3, 4].map((i) => step * i) };
}

export function formatRangeLabel(from: string, to: string) {
  const f = (d: string, withYear: boolean) =>
    new Date(parse(d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  return `${f(from, !sameYear)} – ${f(to, true)}`;
}
