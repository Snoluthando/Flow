"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordReset, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif-display text-xl">
          InvoiceFlow
        </Link>
        <h1 className="mt-6 text-2xl font-medium">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-soft">
          We&apos;ll email you a link to choose a new one.
        </p>

        {state && !state.error ? (
          <p className="mt-6 text-sm bg-accent-soft text-ink rounded-sm px-3 py-3">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border border-border rounded-sm px-3 py-2.5 bg-surface focus:border-accent"
              />
            </div>

            {state?.error && (
              <p className="text-sm text-danger bg-danger-soft rounded-sm px-3 py-2">
                {state.error}
              </p>
            )}

            <SubmitButton pendingText="Sending…" className="w-full">
              Send reset link
            </SubmitButton>
          </form>
        )}

        <p className="mt-6 text-sm text-ink-soft">
          <Link href="/login" className="text-accent hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
