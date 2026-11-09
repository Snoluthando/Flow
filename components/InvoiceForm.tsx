"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { calculateInvoiceTotals, formatMoney } from "@/lib/invoice-calculations";
import type { FormState } from "@/actions/invoices";

type Customer = { id: string; name: string };

type Item = {
  key: string;
  description: string;
  quantity: string;
  unit_price: string;
};

type ExistingInvoice = {
  customer_id: string;
  currency: string;
  issue_date: string;
  due_date: string | null;
  discount_type: "fixed" | "percent";
  discount_value: number;
  tax_rate: number;
  notes: string | null;
  invoice_items: { description: string; quantity: number; unit_price: number }[];
};

const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "AUD", "CAD"];

function emptyItem(): Item {
  return { key: crypto.randomUUID(), description: "", quantity: "1", unit_price: "0" };
}

export function InvoiceForm({
  customers,
  defaults,
  invoice,
  preselectedCustomerId,
  action,
  submitLabel,
  cancelHref,
}: {
  customers: Customer[];
  defaults: {
    currency: string;
    tax_rate: number;
    payment_terms_days: number;
    notes: string | null;
  };
  invoice?: ExistingInvoice;
  preselectedCustomerId?: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, null);

  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const [defaultDueDate] = useState(() =>
    new Date(Date.now() + defaults.payment_terms_days * 86400000).toISOString().slice(0, 10)
  );

  const [items, setItems] = useState<Item[]>(() =>
    invoice && invoice.invoice_items.length > 0
      ? invoice.invoice_items.map((it) => ({
          key: crypto.randomUUID(),
          description: it.description,
          quantity: String(it.quantity),
          unit_price: String(it.unit_price),
        }))
      : [emptyItem()]
  );
  const [discountType, setDiscountType] = useState<"fixed" | "percent">(
    invoice?.discount_type ?? "fixed"
  );
  const [discountValue, setDiscountValue] = useState(String(invoice?.discount_value ?? 0));
  const [taxRate, setTaxRate] = useState(String(invoice?.tax_rate ?? defaults.tax_rate));
  const [currency, setCurrency] = useState(invoice?.currency ?? defaults.currency);

  const totals = useMemo(() => {
    const numericItems = items.map((it) => ({
      quantity: parseFloat(it.quantity) || 0,
      unit_price: parseFloat(it.unit_price) || 0,
    }));
    return calculateInvoiceTotals(
      numericItems,
      discountType,
      parseFloat(discountValue) || 0,
      parseFloat(taxRate) || 0
    );
  }, [items, discountType, discountValue, taxRate]);

  function updateItem(key: string, field: keyof Item, value: string) {
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, [field]: value } : it)));
  }

  function removeItem(key: string) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.key !== key) : prev));
  }

  const itemsJson = JSON.stringify(
    items.map((it) => ({
      description: it.description,
      quantity: parseFloat(it.quantity) || 0,
      unit_price: parseFloat(it.unit_price) || 0,
    }))
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items_json" value={itemsJson} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="customer_id">
            Customer
          </label>
          <select
            id="customer_id"
            name="customer_id"
            defaultValue={invoice?.customer_id ?? preselectedCustomerId ?? ""}
            required
            className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
          >
            <option value="" disabled>
              Select a customer
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="issue_date">
            Issue date
          </label>
          <input
            id="issue_date"
            name="issue_date"
            type="date"
            defaultValue={invoice?.issue_date ?? today}
            required
            className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="due_date">
            Due date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={invoice?.due_date ?? defaultDueDate}
            className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm">Line items</label>
          <button
            type="button"
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
            className="text-sm text-link hover:underline"
          >
            + Add line
          </button>
        </div>

        <div className="border border-card-line rounded-sm bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_90px_120px_120px_32px] gap-2 px-3 py-2 text-xs text-muted border-b border-table-line">
            <span>Description</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span>Line total</span>
            <span />
          </div>
          {items.map((item) => {
            const lineTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
            return (
              <div
                key={item.key}
                className="grid grid-cols-[1fr_90px_120px_120px_32px] gap-2 px-3 py-2 items-center border-b border-table-line last:border-b-0"
              >
                <input
                  value={item.description}
                  onChange={(e) => updateItem(item.key, "description", e.target.value)}
                  placeholder="Item description"
                  required
                  className="border border-input-line rounded-sm px-2 py-1.5 text-sm bg-input focus:border-input-focus"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.key, "quantity", e.target.value)}
                  className="border border-input-line rounded-sm px-2 py-1.5 text-sm bg-input focus:border-input-focus"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.key, "unit_price", e.target.value)}
                  className="border border-input-line rounded-sm px-2 py-1.5 text-sm bg-input focus:border-input-focus"
                />
                <span className="text-sm tabular-nums">{formatMoney(lineTotal, currency)}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-muted hover:text-danger text-sm"
                  aria-label="Remove line"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="discount_type">
            Discount
          </label>
          <div className="flex gap-2">
            <select
              id="discount_type"
              name="discount_type"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "fixed" | "percent")}
              className="border border-input-line rounded-sm px-2 py-2.5 bg-input focus:border-input-focus text-sm"
            >
              <option value="fixed">Fixed</option>
              <option value="percent">%</option>
            </select>
            <input
              name="discount_value"
              type="number"
              min="0"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="tax_rate">
            Tax rate (%)
          </label>
          <input
            id="tax_rate"
            name="tax_rate"
            type="number"
            min="0"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={invoice?.notes ?? defaults.notes ?? ""}
          className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
        />
      </div>

      <div className="border border-card-line rounded-sm bg-card p-4 max-w-xs ml-auto space-y-1.5 text-sm">
        <TotalRow label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
        <TotalRow label="Discount" value={`-${formatMoney(totals.discountTotal, currency)}`} />
        <TotalRow label="Tax" value={formatMoney(totals.taxTotal, currency)} />
        <div className="border-t border-line pt-1.5 flex justify-between font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(totals.total, currency)}</span>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-error bg-error-bg rounded-sm px-3 py-2">{state.error}</p>
      )}

      <div className="flex gap-3">
        <SubmitButton label={submitLabel} />
        <a
          href={cancelHref}
          className="border border-btn-outline px-4 py-2.5 rounded-sm hover:border-btn-outline-hover transition-colors text-sm flex items-center"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-btn text-btn-text px-4 py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
