-- InvoiceFlow — Update 1
-- Adds: a per-business invoice accent colour, and a storage bucket for
-- business logos with RLS so each owner can only manage their own file.

-- ---------------------------------------------------------------------------
-- Invoice theme colour (used on the generated PDF)
-- ---------------------------------------------------------------------------
alter table businesses
  add column if not exists invoice_accent_color text not null default '#2f6f5e';

-- ---------------------------------------------------------------------------
-- Logo storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('business-logos', 'business-logos', true)
on conflict (id) do nothing;

-- Logos are stored at "<owner_id>/<filename>", so the folder name (the
-- first path segment) is used to scope access to the owning user.
create policy "logos: public read"
  on storage.objects for select
  using (bucket_id = 'business-logos');

create policy "logos: owner insert"
  on storage.objects for insert
  with check (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "logos: owner update"
  on storage.objects for update
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "logos: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Include the new business fields in the public invoice RPC so the
-- customer-facing page and PDF can render the logo and theme colour too.
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
      'tax_number', b.tax_number,
      'invoice_accent_color', b.invoice_accent_color
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
