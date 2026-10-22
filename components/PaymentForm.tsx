"use client";

import { useActionState } from "react";
import { recordPayment } from "@/actions/payments";
import { SubmitButton } from "@/components/SubmitButton";

export function PaymentForm({ invoiceId }: { invoiceId: string }) {
  const [state, formAction] = useActionState(recordPayment.bind(null, invoiceId), null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="w-full border border-border rounded-sm px-2.5 py-2 text-sm bg-surface focus:border-accent"
          />
        </div>
        <div>
          <label className="block text-xs mb-1" htmlFor="paid_at">
            Date
          </label>
          <input
            id="paid_at"
            name="paid_at"
            type="date"
            defaultValue={today}
            required
            className="w-full border border-border rounded-sm px-2.5 py-2 text-sm bg-surface focus:border-accent"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs mb-1" htmlFor="reference">
          Reference (optional)
        </label>
        <input
          id="reference"
          name="reference"
          placeholder="e.g. bank transfer ref"
          className="w-full border border-border rounded-sm px-2.5 py-2 text-sm bg-surface focus:border-accent"
        />
      </div>
      <input type="hidden" name="provider" value="manual" />

      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-sm px-3 py-2">{state.error}</p>
      )}

      <SubmitButton pendingText="Recording…" className="w-full text-sm py-2">
        Record payment
      </SubmitButton>
    </form>
  );
}
