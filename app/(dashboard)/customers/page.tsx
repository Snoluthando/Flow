import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const business = await requireBusiness();
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("id, name, email, phone")
    .eq("business_id", business.id)
    .is("archived_at", null)
    .order("name");

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data: customers } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium">Customers</h1>
          <p className="mt-1 text-sm text-muted">People and businesses you invoice.</p>
        </div>
        <Link
          href="/customers/new"
          className="bg-btn text-btn-text px-4 py-2 rounded-sm text-sm hover:opacity-90"
        >
          Add customer
        </Link>
      </div>

      <form className="mt-6" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search customers…"
          className="w-full max-w-xs border border-input-line rounded-sm px-3 py-2 bg-input focus:border-input-focus text-sm"
        />
      </form>

      <div className="mt-6 border border-card-line rounded-sm bg-card divide-y divide-line">
        {customers && customers.length > 0 ? (
          customers.map((c) => (
            <Link
              key={c.id}
              href={`/customers/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-row-hover transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-muted">{c.email || "No email on file"}</p>
              </div>
              <p className="text-xs text-muted">{c.phone}</p>
            </Link>
          ))
        ) : (
          <div className="px-4 py-10 text-center text-sm text-muted">
            {q ? "No customers match that search." : "No customers yet. Add your first one to get started."}
          </div>
        )}
      </div>
    </div>
  );
}
