"use client";

import { useActionState } from "react";
import { sendInvoice } from "@/actions/email";
import { useFormStatus } from "react-dom";

export function SendInvoiceButton({ invoiceId, hasEmail }: { invoiceId: string; hasEmail: boolean }) {
  const [state, formAction] = useActionState(sendInvoice.bind(null, invoiceId), null);

  if (!hasEmail) {
    return (
      <p className="text-sm text-ink-soft">
        Add an email address for this customer before sending.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <SendButton />
      {state?.error && (
        <p className="text-sm text-danger bg-danger-soft rounded-sm px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-accent bg-accent-soft rounded-sm px-3 py-2">Invoice sent.</p>
      )}
    </form>
  );
}

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-accent text-white px-4 py-2 rounded-sm text-sm hover:opacity-90 transition-opacity disabled:opacity-60 w-full"
    >
      {pending ? "Sending…" : "Send invoice"}
    </button>
  );
}
