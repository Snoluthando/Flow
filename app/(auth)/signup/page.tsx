"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export default function SignupPage() {
  const [state, formAction] = useActionState(signUp, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif-display text-xl">
          InvoiceFlow
        </Link>
        <h1 className="mt-6 text-2xl font-medium">Create your account</h1>
        <p className="mt-1 text-sm text-ink-soft">Start invoicing in a couple of minutes.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="fullName">
              Your name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="w-full border border-border rounded-sm px-3 py-2.5 bg-surface focus:border-accent"
            />
          </div>
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
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full border border-border rounded-sm px-3 py-2.5 bg-surface focus:border-accent"
            />
            <p className="mt-1 text-xs text-ink-soft">At least 8 characters.</p>
          </div>

          {state?.error && (
            <p className="text-sm text-danger bg-danger-soft rounded-sm px-3 py-2">{state.error}</p>
          )}

          <SubmitButton pendingText="Creating account…" className="w-full">
            Create account
          </SubmitButton>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
