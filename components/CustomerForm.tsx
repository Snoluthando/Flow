"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/SubmitButton";
import type { FormState } from "@/actions/customers";

type Customer = {
  id?: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
};

export function CustomerForm({
  customer,
  action,
  submitLabel,
}: {
  customer?: Customer;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-4 max-w-lg">
      <div>
        <label className="block text-sm mb-1" htmlFor="name">
          Name / business name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={customer?.name}
          required
          className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
          />
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={customer?.phone ?? ""}
            className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="address">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          rows={2}
          defaultValue={customer?.address ?? ""}
          className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
        />
      </div>
      <div>
        <label className="block text-sm mb-1" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={customer?.notes ?? ""}
          className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-error bg-error-bg rounded-sm px-3 py-2">{state.error}</p>
      )}

      <SubmitButton pendingText="Saving…">{submitLabel}</SubmitButton>
    </form>
  );
}
