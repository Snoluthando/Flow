export type StoredStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled";

/**
 * "Overdue" is derived rather than stored: an invoice that is sent/viewed
 * and past its due date displays as overdue without needing a scheduled job
 * to sweep the table. Draft, paid and cancelled are unaffected.
 */
export function getEffectiveStatus(
  status: StoredStatus,
  dueDate: string | null
): StoredStatus {
  if ((status === "sent" || status === "viewed") && dueDate) {
    const due = new Date(dueDate + "T23:59:59");
    if (due.getTime() < Date.now()) return "overdue";
  }
  return status;
}
