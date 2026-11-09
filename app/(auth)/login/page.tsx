"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [state, formAction] = useActionState(signIn, null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-serif-display text-xl">
          InvoiceFlow
        </Link>
        <h1 className="mt-6 text-2xl font-medium">Log in</h1>
        <p className="mt-1 text-sm text-muted">Welcome back.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm" htmlFor="password">
                Password
              </label>
              <Link href="/reset-password" className="text-sm text-link hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-error bg-error-bg rounded-sm px-3 py-2">{state.error}</p>
          )}

          <SubmitButton pendingText="Logging in…" className="w-full">
            Log in
          </SubmitButton>
        </form>

        <p className="mt-6 text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-link hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
