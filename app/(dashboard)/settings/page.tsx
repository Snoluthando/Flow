import { requireBusiness } from "@/lib/business";
import { BusinessSettingsForm } from "@/components/BusinessSettingsForm";

export default async function SettingsPage() {
  const business = await requireBusiness();

  return (
    <div>
      <h1 className="text-2xl font-medium">Business settings</h1>
      <p className="mt-1 text-sm text-muted">
        This information appears on every invoice and email you send.
      </p>

      <div className="mt-6 max-w-2xl">
        <BusinessSettingsForm business={business} />
      </div>
    </div>
  );
}
