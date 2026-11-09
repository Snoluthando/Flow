import Link from "next/link";
import { Plus } from "lucide-react";
import { GreetingText, TodayDate } from "./Greeting";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function HeroBanner({
  businessName,
  topCustomers,
}: {
  businessName: string;
  topCustomers: { name: string }[];
}) {
  return (
    <section
      className="relative overflow-hidden rounded-card px-6 py-6 sm:px-8 sm:py-7"
      style={{ background: "var(--hero-bg)" }}
    >
      <div className="relative grid gap-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        {/* left: top customers */}
        <div className="order-2 sm:order-1">
          {topCustomers.length > 0 && (
            <>
              <p className="text-xs text-hero-muted">Top customers</p>
              <div className="mt-2 flex items-center">
                <div className="flex -space-x-2">
                  {topCustomers.map((c) => (
                    <span
                      key={c.name}
                      title={c.name}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/30 bg-dash-avatar text-[11px] font-medium text-dash-avatar-text"
                    >
                      {initials(c.name)}
                    </span>
                  ))}
                </div>
                <Link href="/customers" className="ml-3 text-xs text-hero-text hover:underline">
                  All customers
                </Link>
              </div>
            </>
          )}
        </div>

        {/* centre: greeting */}
        <div className="order-1 text-center sm:order-2">
          <GreetingText className="text-sm text-hero-muted" />
          <h1 className="font-serif-display mt-1 text-3xl italic text-hero-text sm:text-4xl">{businessName}</h1>
          <TodayDate className="mt-1.5 text-xs text-hero-muted" />
        </div>

        {/* right: quick action */}
        <div className="order-3 sm:justify-self-end">
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-full bg-hero-chip px-4 py-2 text-sm text-hero-chip-text transition-colors hover:bg-hero-chip-hover"
          >
            <Plus size={16} /> New invoice
          </Link>
        </div>
      </div>
    </section>
  );
}
