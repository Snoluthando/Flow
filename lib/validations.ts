import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(1, "Business name is required").max(200),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  registration_number: z.string().max(100).optional(),
  tax_number: z.string().max(100).optional(),
  default_currency: z.string().min(3).max(3),
  default_tax_rate: z.coerce.number().min(0).max(100),
  default_payment_terms_days: z.coerce.number().int().min(0).max(365),
  default_notes: z.string().max(2000).optional(),
  invoice_prefix: z.string().max(20).default("INV-"),
  invoice_accent_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex color")
    .default("#2f6f5e"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(200),
  email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required").max(500),
  quantity: z.coerce.number().positive("Must be greater than 0"),
  unit_price: z.coerce.number().min(0, "Must be 0 or more"),
});

export const invoiceSchema = z.object({
  customer_id: z.string().uuid("Select a customer"),
  currency: z.string().min(3).max(3),
  issue_date: z.string().min(1),
  due_date: z.string().optional(),
  discount_type: z.enum(["fixed", "percent"]),
  discount_value: z.coerce.number().min(0),
  tax_rate: z.coerce.number().min(0).max(100),
  notes: z.string().max(2000).optional(),
  status: z.enum(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).optional(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one line item"),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paid_at: z.string().min(1),
  provider: z.string().max(50).default("manual"),
  reference: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export type BusinessInput = z.infer<typeof businessSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
