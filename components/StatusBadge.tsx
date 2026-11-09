const STYLES: Record<string, string> = {
  draft: "bg-badge-draft-bg text-badge-draft border border-badge-draft-line",
  sent: "bg-badge-sent-bg text-badge-sent",
  viewed: "bg-badge-viewed-bg text-badge-viewed",
  partially_paid: "bg-badge-partial-bg text-badge-partial",
  paid: "bg-badge-paid-bg text-badge-paid",
  overdue: "bg-badge-overdue-bg text-badge-overdue",
  cancelled: "bg-badge-cancelled-bg text-badge-cancelled border border-badge-draft-line line-through",
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
