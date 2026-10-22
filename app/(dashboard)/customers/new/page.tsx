import Link from "next/link";
import { createCustomer } from "@/actions/customers";
import { CustomerForm } from "@/components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div>
      <Link href="/customers" className="text-sm text-ink-soft hover:text-ink">
        ← Customers
      </Link>
      <h1 className="mt-2 text-2xl font-medium">Add customer</h1>

      <div className="mt-6">
        <CustomerForm action={createCustomer} submitLabel="Add customer" />
      </div>
    </div>
  );
}
