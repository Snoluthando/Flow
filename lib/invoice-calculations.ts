export type LineItem = { quantity: number; unit_price: number };

export type DiscountType = "fixed" | "percent";

/**
 * Single source of truth for invoice math, used both when saving an invoice
 * (server) and when previewing totals live in the invoice form (client).
 * Rounds only at the end to avoid compounding rounding errors.
 */
export function calculateInvoiceTotals(
  items: LineItem[],
  discountType: DiscountType,
  discountValue: number,
  taxRatePercent: number
) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const discountTotal =
    discountType === "percent" ? subtotal * (discountValue / 100) : Math.min(discountValue, subtotal);

  const taxableAmount = Math.max(subtotal - discountTotal, 0);
  const taxTotal = taxableAmount * (taxRatePercent / 100);
  const total = taxableAmount + taxTotal;

  return {
    subtotal: round2(subtotal),
    discountTotal: round2(discountTotal),
    taxTotal: round2(taxTotal),
    total: round2(total),
  };
}

export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
