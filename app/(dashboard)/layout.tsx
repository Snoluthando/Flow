import { requireBusiness } from "@/lib/business";
import { Sidebar } from "@/components/Sidebar";
import { NewInvoiceFab } from "@/components/NewInvoiceFab";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await requireBusiness();

  return (
    <div className="flex min-h-screen">
      <Sidebar businessName={business.name} />
      <main className="flex-1 px-8 py-8 max-w-5xl">{children}</main>
      <NewInvoiceFab />
    </div>
  );
}
