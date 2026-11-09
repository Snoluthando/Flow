"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";

export function NewInvoiceFab() {
  const pathname = usePathname();
  // Don't show it on the page it links to, or while editing an invoice.
  if (pathname === "/invoices/new" || pathname.endsWith("/edit")) return null;

  return (
    <Link
      href="/invoices/new"
      aria-label="New invoice"
      title="New invoice"
      className="fixed bottom-6 right-6 lg:hidden h-12 w-12 rounded-full bg-fab text-fab-text flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity z-40"
    >
      <Plus size={22} />
    </Link>
  );
}
