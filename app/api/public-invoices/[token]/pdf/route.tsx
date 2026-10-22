import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createAnonClient } from "@/lib/supabase/server";
import { InvoicePdf } from "@/lib/pdf/InvoicePdf";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createAnonClient();

  const { data, error } = await supabase.rpc("get_public_invoice", { token });

  if (error || !data || !data.invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const { invoice, business, customer, items } = data;

  const buffer = await renderToBuffer(
    <InvoicePdf invoice={invoice} business={business} customer={customer} items={items} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoice_number}.pdf"`,
    },
  });
}
