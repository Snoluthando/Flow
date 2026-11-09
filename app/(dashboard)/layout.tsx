import { requireBusiness } from "@/lib/business";
import { Sidebar } from "@/components/Sidebar";
import { NewInvoiceFab } from "@/components/NewInvoiceFab";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await requireBusiness();

  return (
    <div className="flex min-h-screen">
      <Sidebar businessName={business.name} />
      <main className="min-w-0 max-w-6xl flex-1 px-6 py-6 lg:px-8">{children}</main>
      <NewInvoiceFab />
    </div>
  );
}
