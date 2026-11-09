"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { FlowLogo } from "./FlowLogo";

// Where each nav item goes. Features / Contact are real sections on the page;
// Pricing and About have no page of their own yet, so they point at the closest
// section — change the hrefs here when they exist.
const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#get-started" },
  { label: "About", href: "#top" },
  { label: "Contact", href: "#contact" },
];

const LOGIN = "rounded-full border border-landing-outline px-4 py-2 text-sm text-landing transition-colors hover:border-landing-outline-hover hover:bg-white/5";
const SIGNUP = "group inline-flex items-center justify-center gap-1.5 rounded-full bg-landing-btn px-4 py-2 text-sm font-medium text-landing-btn-text transition-colors hover:bg-landing-btn-hover";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        solid ? "border-landing-divider bg-landing-nav backdrop-blur-lg" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="InvoiceFlow home" className="text-landing">
          <FlowLogo className="h-7" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 text-sm text-landing-muted md:flex">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-landing">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className={LOGIN}>
            Log In
          </Link>
          <Link href="/signup" className={SIGNUP}>
            Create Account
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-landing-outline text-landing md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-landing-divider px-6 pb-6 pt-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-landing-divider py-3 text-landing-muted transition-colors hover:text-landing"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link href="/login" className={`${LOGIN} text-center`}>
              Log In
            </Link>
            <Link href="/signup" className={SIGNUP}>
              Create Account
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
