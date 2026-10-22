# InvoiceFlow

A focused invoicing SaaS for freelancers and small businesses: create
customers, build invoices, send them by email with a PDF attached, and track
payments — without the overhead of a full accounting platform.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** — Postgres, Auth, Row Level Security
- **Zod** — server-side validation
- **Resend** — transactional email
- **@react-pdf/renderer** — PDF generation
- **date-fns**

## What's implemented

- Sign up / log in / log out / password reset, via Supabase Auth
- Business profile settings (name, contact info, tax info, invoice defaults,
  logo, invoice accent colour)
- Customer CRUD with per-customer invoice history
- Invoice creation and editing with dynamic line items, discounts, tax, and a
  live totals preview
- Invoice statuses: draft, sent, viewed, **partially paid** (derived), paid,
  overdue (derived), cancelled
- PDF generation and download — themed with your logo and accent colour —
  both for the business owner and on the public invoice link
- Email delivery via Resend, with the PDF attached and a link to the public
  invoice page
- A public, tokenised invoice page customers can open without an account
- Manual payment recording (including partial payments), with invoices
  auto-marked paid once fully covered
- A dashboard with total invoiced / paid / outstanding / overdue, plus recent
  invoices and payments
- Light/dark mode, following system preference by default

## Not implemented (by design — see the master prompt's "Future Expansion")

Recurring invoices, automated reminders, multi-currency conversion,
multi-business accounts, online payment collection (Stripe etc.), a customer
portal, quotes/estimates, and custom invoice templates. The schema and code
are structured so these can be added later without a rewrite — for example,
`payments.provider` already exists as a column, ready for a real payment
gateway to write to it after server-side verification.

## Roadmap

**Update 1.2 (planned):** a sister app, OrderFlow, with a shared account
ecosystem — same login across both apps and some data shared between them.
Not yet started; scope to be defined.

## Getting started

### 1. Create a Supabase project

At supabase.com, create a new project, then go to **SQL Editor** and run,
**in order**:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_update_1.sql`

Migration 2 adds the invoice accent colour column and a public `business-logos`
storage bucket with per-owner upload policies. If you're setting up fresh,
just run both files in order — no separate step needed.

Grab your **Project URL** and **anon public key** from **Settings → API**.

### 2. Create a Resend account

At resend.com, verify a sending domain (or use their test domain during
development) and create an API key.

### 3. Configure environment variables

    cp .env.example .env.local

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from step 1
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally, your real domain
  in production (used to build the public invoice link and in emails)
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — from step 2

### 4. Install and run

    npm install
    npm run dev

Visit `http://localhost:3000`, sign up, and you're in.

### 5. Deploy

Push to GitHub and import the repo in Vercel. Add the same environment
variables from `.env.local` in the Vercel project settings, and set
`NEXT_PUBLIC_SITE_URL` to your production URL.

## Project structure

    app/
      (auth)/            Sign up, log in, password reset
      (dashboard)/       Everything behind login: dashboard, customers, invoices, settings
      i/[token]/         Public, unauthenticated invoice view
      api/               PDF generation routes
    actions/             Server actions (auth, business, customers, invoices, payments, email)
    components/          Shared UI: forms, status badges, buttons
    lib/
      supabase/          Browser/server/middleware Supabase clients
      pdf/               React-pdf invoice document
      business.ts        Fetches (and lazily creates) the current user's business
      invoice-calculations.ts  Shared subtotal/discount/tax/total math
      invoice-status.ts  Derives "overdue" without a background job
      validations.ts     Zod schemas
    supabase/migrations/ SQL schema + RLS policies

## Notes on a few design decisions

- **One business per user for now.** The `businesses` table has a unique
  `owner_id`, matching the MVP scope. Moving to multiple businesses per user
  later just means dropping that constraint and adding a business switcher.
- **Overdue is computed, not stored.** An invoice displays as "overdue" when
  it's `sent`/`viewed` and past its due date, computed at read time
  (`lib/invoice-status.ts`). No cron job required for the MVP.
- **Invoice line items are copied at creation time.** They don't reference a
  live product catalog, so past invoices never change if you update a price
  elsewhere.
- **Editing is limited to drafts.** Once an invoice is sent, its numbers are
  what the customer already has; further changes go through recording a
  payment, cancelling, or creating a new invoice (e.g. via "Duplicate").
