import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <span className="font-serif-display text-xl tracking-tight">InvoiceFlow</span>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/login" className="text-ink-soft hover:text-ink">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-ink text-white px-4 py-2 rounded-sm hover:bg-accent transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-16">
          <h1 className="font-serif-display text-5xl leading-tight max-w-2xl">
            Send an invoice. Get paid. Know where things stand.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            InvoiceFlow is a focused invoicing tool for freelancers and small
            businesses — no ledgers, no chart of accounts, just invoices that
            go out and payments you can track.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/signup"
              className="bg-accent text-white px-5 py-3 rounded-sm hover:opacity-90 transition-opacity"
            >
              Create your account
            </Link>
            <Link
              href="/login"
              className="border border-border px-5 py-3 rounded-sm hover:border-ink transition-colors"
            >
              I already have one
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-5xl px-6 py-14 grid sm:grid-cols-3 gap-10">
            <div>
              <p className="font-serif-display text-2xl">01</p>
              <h2 className="mt-2 font-medium">Build the invoice</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Add line items, apply a discount or tax, and set a due date.
                Totals calculate as you go.
              </p>
            </div>
            <div>
              <p className="font-serif-display text-2xl">02</p>
              <h2 className="mt-2 font-medium">Send it</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Your customer gets an email with a PDF attached and a link to
                view and pay online — no account required.
              </p>
            </div>
            <div>
              <p className="font-serif-display text-2xl">03</p>
              <h2 className="mt-2 font-medium">Track it</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Record payments as they land and watch your dashboard show
                exactly what&apos;s outstanding.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-6 text-sm text-ink-soft">
          InvoiceFlow
        </div>
      </footer>
    </div>
  );
}
