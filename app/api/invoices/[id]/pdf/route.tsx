import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { requireBusiness } from "@/lib/business";
import { InvoicePdf } from "@/lib/pdf/InvoicePdf";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const business = await requireBusiness();
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(name, email, address), invoice_items(*)")
    .eq("id", id)
    .eq("business_id", business.id)
    .single();

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <InvoicePdf
      invoice={invoice}
      business={business}
      customer={invoice.customers}
      items={(invoice.invoice_items ?? []).sort(
        (a: { position: number }, b: { position: number }) => a.position - b.position
      )}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
