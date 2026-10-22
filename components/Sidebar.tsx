"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
  { href: "/customers", label: "Customers" },
  { href: "/settings", label: "Business settings" },
];

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-border bg-surface min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-border flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href="/dashboard" className="font-serif-display text-lg">
            InvoiceFlow
          </Link>
          <p className="mt-0.5 text-xs text-ink-soft truncate">{businessName || "Your business"}</p>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-sm text-sm transition-colors ${
                active
                  ? "bg-accent-soft text-ink font-medium"
                  : "text-ink-soft hover:bg-paper hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 text-sm text-ink-soft hover:text-ink"
          >
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
