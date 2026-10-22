const STYLES: Record<string, string> = {
  draft: "bg-paper text-ink-soft border border-border",
  sent: "bg-accent-soft text-accent",
  viewed: "bg-accent-soft text-accent",
  partially_paid: "bg-amber-soft text-amber",
  paid: "bg-accent text-white",
  overdue: "bg-danger-soft text-danger",
  cancelled: "bg-paper text-ink-soft border border-border line-through",
};

const LABELS: Record<string, string> = {
  partially_paid: "Partially paid",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-sm text-xs font-medium capitalize ${
        STYLES[status] ?? STYLES.draft
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
