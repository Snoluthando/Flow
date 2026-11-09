"use client";

import { useActionState, useState } from "react";
import { updateBusiness } from "@/actions/business";
import { SubmitButton } from "@/components/SubmitButton";
import type { Business } from "@/lib/business";

const CURRENCIES = ["USD", "EUR", "GBP", "ZAR", "AUD", "CAD"];
const PRESET_COLORS = ["#2f6f5e", "#17233b", "#92650f", "#b3261e", "#3a5ba0", "#6b4e9e"];

export function BusinessSettingsForm({ business }: { business: Business }) {
  const [state, formAction] = useActionState(updateBusiness, null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logo_url);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [accentColor, setAccentColor] = useState(business.invoice_accent_color || "#2f6f5e");

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setRemoveLogo(false);
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium mb-1">Business details</legend>
        <Field label="Business name" name="name" defaultValue={business.name} required />
        <Field label="Email" name="email" type="email" defaultValue={business.email ?? ""} />
        <Field label="Phone" name="phone" defaultValue={business.phone ?? ""} />
        <TextArea label="Address" name="address" defaultValue={business.address ?? ""} />
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Registration number"
            name="registration_number"
            defaultValue={business.registration_number ?? ""}
          />
          <Field label="Tax / VAT number" name="tax_number" defaultValue={business.tax_number ?? ""} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 pt-4 border-t border-line">
        <legend className="text-sm font-medium mb-1">Logo &amp; invoice theme</legend>
        <p className="text-xs text-muted -mt-2">
          Both appear on your generated invoice PDFs.
        </p>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-sm border border-line bg-subtle flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview && !removeLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-muted">No logo</span>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="logo" className="block text-sm">
              Upload logo
            </label>
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoChange}
              className="text-sm"
            />
            {business.logo_url && !removeLogo && (
              <button
                type="button"
                onClick={() => {
                  setRemoveLogo(true);
                  setLogoPreview(null);
                }}
                className="block text-xs text-danger hover:underline"
              >
                Remove current logo
              </button>
            )}
            <input type="hidden" name="remove_logo" value={removeLogo ? "1" : "0"} />
            <p className="text-xs text-muted">PNG, JPEG, WebP or SVG. Up to 2MB.</p>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="invoice_accent_color">
            Invoice accent colour
          </label>
          <div className="flex items-center gap-3">
            <input
              id="invoice_accent_color"
              name="invoice_accent_color"
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-9 w-14 border border-input-line rounded-sm bg-input cursor-pointer"
            />
            <div className="flex gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  className="h-6 w-6 rounded-full border border-line"
                  style={{ backgroundColor: c }}
                  aria-label={`Use ${c}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted tabular-nums">{accentColor}</span>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 pt-4 border-t border-line">
        <legend className="text-sm font-medium mb-1">Invoice defaults</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="default_currency">
              Default currency
            </label>
            <select
              id="default_currency"
              name="default_currency"
              defaultValue={business.default_currency}
              className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="Default tax rate (%)"
            name="default_tax_rate"
            type="number"
            step="0.01"
            defaultValue={String(business.default_tax_rate)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Payment terms (days)"
            name="default_payment_terms_days"
            type="number"
            defaultValue={String(business.default_payment_terms_days)}
          />
          <Field
            label="Invoice number prefix"
            name="invoice_prefix"
            defaultValue={business.invoice_prefix}
          />
        </div>
        <TextArea
          label="Default invoice notes"
          name="default_notes"
          defaultValue={business.default_notes ?? ""}
          placeholder="e.g. payment instructions, thank-you note"
        />
      </fieldset>

      {state?.error && (
        <p className="text-sm text-error bg-error-bg rounded-sm px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-success bg-success-bg rounded-sm px-3 py-2">Settings saved.</p>
      )}

      <SubmitButton pendingText="Saving…">Save settings</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  step?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm mb-1" htmlFor={name}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={3}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full border border-input-line rounded-sm px-3 py-2.5 bg-input focus:border-input-focus"
      />
    </div>
  );
}
