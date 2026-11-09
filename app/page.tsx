import Link from "next/link";
import { ArrowRight, BarChart3, FileText, Send, type LucideIcon } from "lucide-react";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/playfair-display/wght.css";
import { LandingBackground } from "@/components/LandingBackground";
import { FlowLogo } from "@/components/landing/FlowLogo";
import { LandingNav } from "@/components/landing/LandingNav";
import { Reveal } from "@/components/landing/Reveal";

const STEPS: { n: string; title: string; text: string; icon: LucideIcon }[] = [
  {
    n: "01",
    title: "Build the invoice",
    text: "Add line items, apply a discount or tax, and set a due date. Totals calculate as you go.",
    icon: FileText,
  },
  {
    n: "02",
    title: "Send it",
    text: "Your customer gets an email with a PDF attached and a link to view and pay online — no account required.",
    icon: Send,
  },
  {
    n: "03",
    title: "Track it",
    text: "Record payments as they land and watch your dashboard show exactly what\u2019s outstanding.",
    icon: BarChart3,
  },
];

const GLASS =
  "rounded-3xl border border-landing-card-line bg-landing-card shadow-landing-card backdrop-blur-xl";

export default function LandingPage() {
  return (
    <div data-landing className="relative min-h-screen bg-landing-base font-landing-sans text-landing">
      {/* content is always visible if JavaScript is off */}
      <noscript>
        <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>

      <LandingBackground />
      <LandingNav />

      <main id="top" className="relative z-10">
        {/* ---------------- hero ---------------- */}
        <section className="mx-auto flex min-h-[100svh] max-w-6xl items-center px-6 pb-16 pt-28 lg:pt-24">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[minmax(0,33rem)_1fr] lg:gap-10">
            <Reveal>
              <div className={`${GLASS} p-6 sm:p-10`}>
                <Reveal delay={100}>
                  <p className="text-xs font-medium uppercase tracking-[0.22em] text-landing-accent">InvoiceFlow</p>
                </Reveal>
                <Reveal delay={200}>
                  <h1 className="mt-5 font-landing-serif text-[2.15rem] leading-[1.08] sm:text-6xl">
                    Send an invoice.
                    <br />
                    Get paid.
                    <span className="mt-3 block bg-linear-to-r from-landing-accent to-landing-accent-2 bg-clip-text text-2xl leading-tight text-transparent sm:text-3xl">
                      Know where things stand.
                    </span>
                  </h1>
                </Reveal>
                <Reveal delay={320}>
                  <p className="mt-6 leading-relaxed text-landing-muted">
                    InvoiceFlow is a focused invoicing tool for freelancers and small businesses — no ledgers, no chart
                    of accounts, just invoices that go out and payments you can track.
                  </p>
                </Reveal>
                <Reveal delay={440}>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="/signup"
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-landing-btn px-6 py-3 text-sm font-medium text-landing-btn-text transition-colors hover:bg-landing-btn-hover"
                    >
                      Create your account
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href="#features"
                      className="inline-flex items-center justify-center rounded-full border border-landing-outline px-6 py-3 text-sm text-landing transition-colors hover:border-landing-outline-hover hover:bg-white/5"
                    >
                      Learn more
                    </a>
                  </div>
                </Reveal>
              </div>
            </Reveal>

            <Reveal delay={600} className="relative flex flex-col items-center text-center">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-96 sm:w-96"
                style={{ background: "radial-gradient(closest-side, var(--landing-glow), transparent)" }}
              />
              <FlowLogo className="relative h-24 text-landing/70 sm:h-32 lg:h-44" />
              <p className="relative mt-7 text-base tracking-wide text-landing-muted sm:text-lg">
                One ecosystem. Endless possibilities.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- three steps ---------------- */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-24">
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.n} delay={i * 150} className="h-full">
                  <article className="group h-full rounded-2xl border border-landing-card-line bg-landing-card p-6 shadow-landing-card backdrop-blur-xl transition duration-300 hover:-translate-y-1.5 hover:border-landing-card-line-hover motion-reduce:hover:translate-y-0">
                    <div className="flex items-start justify-between">
                      <span className="font-landing-serif text-3xl text-landing-accent lining-nums">{s.n}</span>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-landing-card-line bg-landing-icon text-landing-accent transition-shadow duration-300 group-hover:shadow-landing-icon">
                        <Icon size={20} />
                      </span>
                    </div>
                    <h2 className="mt-8 font-landing-serif text-2xl">{s.title}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-landing-muted">{s.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ---------------- second call to action ---------------- */}
        <section id="get-started" className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-28">
          <Reveal>
            <div className={`${GLASS} relative overflow-hidden px-8 py-16 text-center sm:px-16 sm:py-20`}>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse 60% 70% at 50% 0%, var(--landing-glow), transparent 70%), radial-gradient(ellipse 40% 50% at 100% 100%, var(--fog-purple), transparent 70%)",
                }}
              />
              <div className="relative">
                <h2 className="font-landing-serif text-4xl leading-tight sm:text-5xl">Your invoices. Under control.</h2>
                <p className="mx-auto mt-5 max-w-xl text-landing-muted">
                  Spend less time managing payments and more time running your business.
                </p>
                <Link
                  href="/signup"
                  className="group mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-landing-btn px-7 py-3.5 text-sm font-medium text-landing-btn-text transition-colors hover:bg-landing-btn-hover"
                >
                  Get started with InvoiceFlow
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ---------------- footer ---------------- */}
      <footer id="contact" className="relative z-10 scroll-mt-24 border-t border-landing-divider">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-landing-muted sm:flex-row">
          <span className="flex items-center gap-3">
            <FlowLogo variant="mark" className="h-5 text-landing/70" />
            InvoiceFlow
          </span>
          <nav aria-label="Footer" className="flex gap-6">
            <Link href="/login" className="transition-colors hover:text-landing">
              Log In
            </Link>
            <Link href="/signup" className="transition-colors hover:text-landing">
              Create Account
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
