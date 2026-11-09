"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, LogOut, Plus, Settings, Users, type LucideIcon } from "lucide-react";
import { signOut } from "@/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

const SECTIONS: { label: string; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    label: "Menu",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/invoices", label: "Invoices", icon: FileText },
      { href: "/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/settings", label: "Business settings", icon: Settings }],
  },
];

export function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();
  const name = businessName || "Your business";

  return (
    <aside className="sticky top-3 m-3 flex h-[calc(100vh-1.5rem)] w-64 shrink-0 flex-col rounded-card border border-sidebar-line bg-sidebar shadow-sidebar">
      <div className="flex items-center justify-between gap-2 px-5 pb-4 pt-5">
        <Link href="/dashboard" className="font-serif-display text-xl text-sidebar-brand">
          InvoiceFlow
        </Link>
        <ThemeToggle />
      </div>

      <div className="px-4">
        <Link
          href="/invoices/new"
          className="flex items-center justify-center gap-2 rounded-xl bg-nav-cta px-4 py-2.5 text-sm font-medium text-nav-cta-text transition-colors hover:bg-nav-cta-hover"
        >
          <Plus size={16} /> Create invoice
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-section">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-nav-active-bg font-medium text-nav-active"
                        : "text-nav hover:bg-nav-hover-bg hover:text-nav-hover"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-nav-active-icon" : "text-nav-icon"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="m-3 rounded-xl bg-sidebar-user p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sidebar-avatar text-sm font-medium text-sidebar-avatar-text">
            {name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-brand">{name}</p>
            <p className="text-xs text-sidebar-meta">Signed in</p>
          </div>
        </div>
        <form action={signOut} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-nav transition-colors hover:text-nav-hover"
          >
            <LogOut size={16} className="text-nav-icon" /> Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
