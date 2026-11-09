"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export default function UpdatePasswordPage() {
  const [state, formAction] = useActionState(updatePassword, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif-display text-xl">
          InvoiceFlow
        </Link>
        <h1 className="mt-6 text-2xl font-medium">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted">
          You followed a reset link — set a new password below.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-error bg-error-bg rounded-sm px-3 py-2">{state.error}</p>
          )}

          <SubmitButton pendingText="Saving…" className="w-full">
            Save new password
          </SubmitButton>
        </form>

        <p className="mt-6 text-sm text-muted">
          <Link href="/login" className="text-link hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
