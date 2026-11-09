export type StoredStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";
export type EffectiveStatus = StoredStatus | "partially_paid";

/**
 * "Overdue" and "Partially paid" are both derived at display time rather
 * than stored, so there's no background job needed to keep them in sync:
 *  - Partially paid: some (but not all) of the total has been paid.
 *  - Overdue: sent/viewed, past the due date, and not (partially) paid off.
 * Paid and cancelled always win, since they're deliberate end states.
 */
export function getEffectiveStatus(
  status: StoredStatus,
  dueDate: string | null,
  amountPaid = 0,
  total = 0
): EffectiveStatus {
  if (status === "paid" || status === "cancelled") return status;

  if (amountPaid > 0 && amountPaid < total) return "partially_paid";

  if ((status === "sent" || status === "viewed") && dueDate) {
    const due = new Date(dueDate + "T23:59:59");
    if (due.getTime() < Date.now()) return "overdue";
  }

  return status;
}
