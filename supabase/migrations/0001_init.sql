-- InvoiceFlow initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- Automatically create a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- businesses: one business profile per user (MVP = single business/user)
-- ---------------------------------------------------------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  logo_url text,
  email text,
  phone text,
  address text,
  registration_number text,
  tax_number text,
  default_currency text not null default 'USD',
  default_tax_rate numeric(6, 3) not null default 0,
  default_payment_terms_days int not null default 14,
  default_notes text,
  invoice_prefix text not null default 'INV-',
  next_invoice_number int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id)
);

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_business_id_idx on customers (business_id);

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
do $$ begin
  create type invoice_status as enum ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses (id) on delete cascade,
  customer_id uuid not null references customers (id) on delete restrict,
  invoice_number text not null,
  status invoice_status not null default 'draft',
  currency text not null default 'USD',
  issue_date date not null default current_date,
  due_date date,
  discount_type text not null default 'fixed', -- 'fixed' | 'percent'
  discount_value numeric(12, 2) not null default 0,
  tax_rate numeric(6, 3) not null default 0,
  subtotal numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  amount_paid numeric(12, 2) not null default 0,
  notes text,
  public_token uuid not null default gen_random_uuid(),
  sent_at timestamptz,
  viewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, invoice_number),
  unique (public_token)
);

create index if not exists invoices_business_id_idx on invoices (business_id);
create index if not exists invoices_customer_id_idx on invoices (customer_id);
create index if not exists invoices_public_token_idx on invoices (public_token);

-- ---------------------------------------------------------------------------
-- invoice_items: price/description are copied at creation time and never
-- recomputed from a live product catalog, so historical invoices stay fixed.
-- ---------------------------------------------------------------------------
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  position int not null default 0,
  description text not null,
  quantity numeric(12, 3) not null default 1,
  unit_price numeric(12, 2) not null default 0,
  line_total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists invoice_items_invoice_id_idx on invoice_items (invoice_id);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  amount numeric(12, 2) not null,
  paid_at date not null default current_date,
  provider text not null default 'manual', -- 'manual' | 'stripe' | ...
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists payments_invoice_id_idx on payments (invoice_id);

-- ---------------------------------------------------------------------------
-- email_logs
-- ---------------------------------------------------------------------------
create table if not exists email_logs (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  business_id uuid not null references businesses (id) on delete cascade,
  to_email text not null,
  subject text not null,
  status text not null default 'sent', -- 'sent' | 'failed'
  error text,
  created_at timestamptz not null default now()
);

create index if not exists email_logs_invoice_id_idx on email_logs (invoice_id);

-- ---------------------------------------------------------------------------
-- updated_at helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on businesses;
create trigger set_updated_at before update on businesses
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on customers;
create trigger set_updated_at before update on customers
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_updated_at on invoices;
create trigger set_updated_at before update on invoices
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table customers enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table payments enable row level security;
alter table email_logs enable row level security;

-- profiles: a user can only see/edit their own profile row
create policy "profiles: select own" on profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on profiles
  for update using (auth.uid() = id);

-- businesses: owner-only access
create policy "businesses: select own" on businesses
  for select using (auth.uid() = owner_id);
create policy "businesses: insert own" on businesses
  for insert with check (auth.uid() = owner_id);
create policy "businesses: update own" on businesses
  for update using (auth.uid() = owner_id);
create policy "businesses: delete own" on businesses
  for delete using (auth.uid() = owner_id);

-- helper: is the given business owned by the current user?
create or replace function public.owns_business(target_business_id uuid)
returns boolean as $$
  select exists (
    select 1 from businesses
    where id = target_business_id and owner_id = auth.uid()
  );
$$ language sql stable security definer set search_path = public;

-- customers
create policy "customers: select own" on customers
  for select using (public.owns_business(business_id));
create policy "customers: insert own" on customers
  for insert with check (public.owns_business(business_id));
create policy "customers: update own" on customers
  for update using (public.owns_business(business_id));
create policy "customers: delete own" on customers
  for delete using (public.owns_business(business_id));

-- invoices
create policy "invoices: select own" on invoices
  for select using (public.owns_business(business_id));
create policy "invoices: insert own" on invoices
  for insert with check (public.owns_business(business_id));
create policy "invoices: update own" on invoices
  for update using (public.owns_business(business_id));
create policy "invoices: delete own" on invoices
  for delete using (public.owns_business(business_id));

-- invoice_items: scoped through the parent invoice's business
create policy "invoice_items: select own" on invoice_items
  for select using (
    exists (select 1 from invoices i where i.id = invoice_id and public.owns_business(i.business_id))
  );
create policy "invoice_items: insert own" on invoice_items
  for insert with check (
    exists (select 1 from invoices i where i.id = invoice_id and public.owns_business(i.business_id))
  );
create policy "invoice_items: update own" on invoice_items
  for update using (
    exists (select 1 from invoices i where i.id = invoice_id and public.owns_business(i.business_id))
  );
create policy "invoice_items: delete own" on invoice_items
  for delete using (
    exists (select 1 from invoices i where i.id = invoice_id and public.owns_business(i.business_id))
  );

-- payments
create policy "payments: select own" on payments
  for select using (public.owns_business(business_id));
create policy "payments: insert own" on payments
  for insert with check (public.owns_business(business_id));
create policy "payments: update own" on payments
  for update using (public.owns_business(business_id));
create policy "payments: delete own" on payments
  for delete using (public.owns_business(business_id));

-- email_logs
create policy "email_logs: select own" on email_logs
  for select using (public.owns_business(business_id));
create policy "email_logs: insert own" on email_logs
  for insert with check (public.owns_business(business_id));

-- ---------------------------------------------------------------------------
-- Public invoice access: anonymous customers open an invoice via its
-- unguessable public_token, through a SECURITY DEFINER RPC rather than a
-- broad RLS policy, so no other business data is ever exposed.
-- ---------------------------------------------------------------------------
create or replace function public.get_public_invoice(token uuid)
returns json as $$
  select json_build_object(
    'invoice', json_build_object(
      'id', i.id,
      'invoice_number', i.invoice_number,
      'status', i.status,
      'currency', i.currency,
      'issue_date', i.issue_date,
      'due_date', i.due_date,
      'subtotal', i.subtotal,
      'discount_total', i.discount_total,
      'tax_total', i.tax_total,
      'total', i.total,
      'amount_paid', i.amount_paid,
      'notes', i.notes,
      'public_token', i.public_token
    ),
    'business', json_build_object(
      'name', b.name,
      'logo_url', b.logo_url,
      'email', b.email,
      'phone', b.phone,
      'address', b.address,
      'tax_number', b.tax_number
    ),
    'customer', json_build_object(
      'name', c.name,
      'email', c.email,
      'address', c.address
    ),
    'items', (
      select coalesce(json_agg(json_build_object(
        'description', ii.description,
        'quantity', ii.quantity,
        'unit_price', ii.unit_price,
        'line_total', ii.line_total
      ) order by ii.position), '[]'::json)
      from invoice_items ii where ii.invoice_id = i.id
    )
  )
  from invoices i
  join businesses b on b.id = i.business_id
  join customers c on c.id = i.customer_id
  where i.public_token = token;
$$ language sql stable security definer set search_path = public;

-- Mark an invoice as viewed the first time a customer opens the public link.
create or replace function public.mark_invoice_viewed(token uuid)
returns void as $$
  update invoices
  set viewed_at = coalesce(viewed_at, now()),
      status = case when status = 'sent' then 'viewed' else status end
  where public_token = token;
$$ language sql security definer set search_path = public;
