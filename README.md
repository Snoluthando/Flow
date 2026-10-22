# Flow Ecosystem

Flow is a connected ecosystem of lightweight business applications designed to help businesses manage essential workflows through focused, purpose-built tools. Each application solves a distinct business problem while sharing a common foundation for identity, organisations, permissions, and relevant business data.

The ecosystem currently consists of **InvoiceFlow**, **OrderFlow**, and **SpendFlow**.

## Vision and design principles

Flow is intended to make everyday business operations easier to manage without forcing businesses to adopt one oversized, all-in-one application.

The ecosystem follows these principles:

- **Focused applications:** Each product has a clear purpose and its own product-specific workflows.
- **Shared identity:** Users should be able to use the same Flow account across applications.
- **Shared business context:** Applications can use common organisation, membership, role, and branch records where appropriate.
- **Controlled data access:** Shared infrastructure does not mean unrestricted access to every product's data. Access must be enforced through application permissions and Supabase Row Level Security (RLS).
- **Independent deployment:** Each application should be buildable and deployable independently.
- **Lightweight architecture:** Prefer simple, maintainable solutions. Add shared packages and infrastructure only when there is a clear need.
- **Room to grow:** Products can gain additional features without requiring the entire ecosystem to be redesigned.

## Applications

### InvoiceFlow

**Purpose:** Simplify invoicing for small businesses, freelancers, and service providers.

InvoiceFlow focuses on the practical invoicing workflow rather than attempting to be a full accounting system.

Planned and core capabilities include:

- Business profile and customer management.
- Product and service details.
- Invoice creation and management.
- Tax, discount, subtotal, and total calculations.
- Invoice preview and PDF generation.
- Emailing invoices to customers.
- Invoice status tracking, including paid and outstanding invoices.
- Basic revenue and outstanding-payment summaries.

InvoiceFlow owns its invoice-specific workflows and records. Other Flow applications should not automatically gain access to invoice data merely because they share the same identity platform.

### OrderFlow

**Purpose:** Streamline order placement, processing, and communication between a business and its clients.

OrderFlow focuses on managing orders and reducing manual steps in the order workflow.

Planned capabilities include:

- Order creation and management.
- Order status tracking.
- Recording order activity in the database.
- Client email notifications and workflow updates.
- A foundation for future inventory, stock, and logistics integrations.

OrderFlow owns its order-specific workflows and records. Any future integration with inventory, invoicing, or logistics should use explicit data relationships and permissions rather than creating unnecessary coupling between applications.

### SpendFlow

**Purpose:** Help businesses record, monitor, and understand purchases and expenditure across branches.

SpendFlow is designed around the challenge of tracking purchases made by different branches, including purchases supported by card transactions and paper receipts. It aims to reduce paper-based administration and make spending information easier for head office to review.

Planned capabilities include:

- Recording and categorising purchases.
- Capturing information from receipts and card-purchase records.
- Associating expenditure with the correct business and branch.
- Centralising purchase records for head-office review.
- Branch-level spending summaries.
- Basic business intelligence and expenditure reporting.

SpendFlow owns its purchase and expenditure records. Access to branch-level and organisation-wide information must follow the user's permissions.

## Repository structure

The repository is a **monorepo**: one Git repository containing multiple applications and, where useful, shared packages. A monorepo does not mean that the products are one application or must be deployed together.

The following is the intended structure. Directories should be added as they become necessary; this tree is a guide rather than a requirement to create empty folders in advance.

```text
flow/
├── apps/
│   ├── invoiceflow/          # Invoicing application
│   ├── orderflow/            # Order management application
│   └── spendflow/            # Purchase tracking and reporting application
│
├── packages/
│   ├── shared-ui/            # Reusable UI components, if needed
│   ├── shared-types/         # Types shared across applications, if needed
│   └── shared-utils/         # Small, genuinely shared utilities, if needed
│
├── supabase/
│   ├── migrations/           # Version-controlled database migrations
│   └── functions/            # Shared or platform-level Edge Functions, if needed
│
├── package.json              # Root scripts and workspace configuration
├── package-lock.json         # npm dependency lockfile, if using npm
├── tsconfig.base.json        # Shared TypeScript defaults, if appropriate
├── turbo.json                # Optional Turborepo configuration
├── .gitignore
└── README.md
```

### `apps/`

Each application has its own interface, routes, product logic, dependencies where appropriate, environment configuration, and build/deployment configuration.

- `apps/invoiceflow/` contains InvoiceFlow.
- `apps/orderflow/` contains OrderFlow.
- `apps/spendflow/` contains SpendFlow.

Applications should remain independently understandable and deployable. Avoid placing product-specific business logic in shared packages just to reduce file counts.

### `packages/`

This directory is for code that genuinely needs to be reused by more than one application.

- `shared-ui/`: reusable interface elements and design primitives.
- `shared-types/`: shared TypeScript types for common concepts such as organisations or memberships.
- `shared-utils/`: small shared utility functions.

These packages are optional. Create them only when real reuse exists, and keep product-specific functionality within its application.

### `supabase/`

This directory contains version-controlled backend assets for the shared Supabase environment.

- `migrations/` records database schema changes in a repeatable, reviewable order.
- `functions/` may contain Edge Functions used across applications or by the shared platform.

The Supabase project itself is hosted separately. This repository contains code and configuration, not the live database service.

Do not commit database passwords, service-role keys, access tokens, or other secrets. Use environment variables and the hosting provider's secret-management settings.

## Shared platform and data boundaries

The applications can share a Supabase project while keeping their business responsibilities distinct.

### Common platform data

The shared foundation may include:

- **Users and authentication:** Supabase Auth manages user identity and sign-in.
- **Organisations:** represent the businesses using Flow.
- **Memberships:** connect users to organisations.
- **Roles and permissions:** determine what a user may do.
- **Branches:** represent business locations where the organisation needs them.

The exact schema should be established through reviewed migrations. Avoid duplicating the same organisation or membership model separately in each application.

### Product-specific data

Keep each product's operational data clearly scoped. Examples include:

- InvoiceFlow: invoices, invoice line items, customers, and invoicing-specific settings.
- OrderFlow: orders, order items, and order-processing events.
- SpendFlow: purchases, receipt records, expenditure categories, and spending summaries.

Names and table boundaries may change as the implementation evolves. The important rule is to define ownership and access explicitly.

### Security requirements

- Enable and test Row Level Security on tables exposed to client applications.
- Check organisation membership and role permissions before allowing access to business records.
- Apply branch-level restrictions where required.
- Never rely only on hiding a button or page in the frontend as a security control.
- Keep privileged service-role credentials on trusted server-side infrastructure only.
- Share data between products only when the use case, schema, and permissions are clear.

## Development and deployment

### Independent applications

Each application should be runnable and deployable on its own. A change to one application should not automatically require a release of the others, unless the change affects a shared dependency or backend contract.

A hosting provider such as Vercel can deploy each application from its directory in the monorepo. Each deployment must be configured with the correct application root, build settings, and environment variables.

Example future subdomains:

- `invoiceflow.example.com`
- `orderflow.example.com`
- `spendflow.example.com`
- `example.com` for a Flow landing page, if one is created.

These are illustrative only; actual domains must be configured separately.

### Workspace and build tooling

Start with a simple workspace setup, such as npm workspaces, if the applications use compatible JavaScript/TypeScript tooling. Add Turborepo only if build orchestration, caching, or task coordination becomes useful. Do not introduce tools solely because they are common in monorepos.

Each application should document its own local setup and scripts as implementation details are finalised.

## Git workflow

- `main` is the stable integration branch.
- Use short-lived feature or fix branches for work in progress.
- Do not use permanent branches as separate homes for InvoiceFlow, OrderFlow, and SpendFlow.
- Keep commits focused and describe the change clearly.
- Review database migrations and shared-package changes carefully because they may affect multiple applications.

Example branch names:

- `feat/invoice-pdf`
- `fix/order-email-notification`
- `feat/spendflow-branch-reports`
- `chore/shared-auth-types`

## Current status

This README describes the intended architecture and product direction. Feature lists and directory structures are plans, not a claim that every capability or directory has already been implemented. Update this document as the architecture and applications evolve.

## Summary

**Flow is one ecosystem with three focused products:**

- **InvoiceFlow** — create, send, and track invoices.
- **OrderFlow** — manage orders and client communication.
- **SpendFlow** — record purchases and understand expenditure across branches.

The repository keeps their code together for maintainability and reuse, while the applications remain separate products with independent deployments and controlled access to a shared platform.
