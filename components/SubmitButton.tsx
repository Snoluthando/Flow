"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText,
  className = "",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`bg-accent text-white px-4 py-2.5 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {pending ? pendingText ?? "Please wait…" : children}
    </button>
  );
}
