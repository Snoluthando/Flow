import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { formatMoney } from "@/lib/invoice-calculations";
import { PDF_COLORS } from "./theme";

const INK = PDF_COLORS.text;
const INK_SOFT = PDF_COLORS.textMuted;
const BORDER = PDF_COLORS.line;

function buildStyles(accentColor: string) {
  return StyleSheet.create({
    page: { padding: 40, fontSize: 10, color: INK, fontFamily: "Helvetica" },
    headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
    logo: { width: 48, height: 48, marginBottom: 8, objectFit: "contain" },
    businessName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
    small: { fontSize: 9, color: INK_SOFT, marginBottom: 1 },
    invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: "right", color: accentColor },
    invoiceMeta: { fontSize: 9, color: INK_SOFT, textAlign: "right", marginTop: 2 },
    section: { marginBottom: 20 },
    label: { fontSize: 8, color: INK_SOFT, textTransform: "uppercase", marginBottom: 3 },
    table: { marginTop: 10, borderTop: `1pt solid ${BORDER}` },
    tableRow: {
      flexDirection: "row",
      borderBottom: `1pt solid ${BORDER}`,
      paddingVertical: 6,
    },
    tableHeaderRow: {
      flexDirection: "row",
      paddingVertical: 6,
      borderBottom: `1.5pt solid ${accentColor}`,
    },
    colDescription: { flex: 4 },
    colQty: { flex: 1, textAlign: "right" },
    colPrice: { flex: 1.5, textAlign: "right" },
    colTotal: { flex: 1.5, textAlign: "right" },
    totalsBlock: { marginTop: 16, alignSelf: "flex-end", width: 220 },
    totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    totalsLabel: { color: INK_SOFT },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderTop: `1pt solid ${accentColor}`,
      marginTop: 4,
      paddingTop: 6,
    },
    grandTotalLabel: { fontWeight: 700, color: accentColor },
    notes: { marginTop: 28, fontSize: 9, color: INK_SOFT },
  });
}

export type PdfInvoiceData = {
  invoice_number: string;
  status: string;
  currency: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  total: number;
  amount_paid: number;
  notes: string | null;
};

export type PdfBusinessData = {
  name: string;
  logo_url?: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  invoice_accent_color?: string | null;
};

export type PdfCustomerData = {
  name: string;
  email: string | null;
  address: string | null;
};

export type PdfItem = { description: string; quantity: number; unit_price: number; line_total: number };

export function InvoicePdf({
  invoice,
  business,
  customer,
  items,
}: {
  invoice: PdfInvoiceData;
  business: PdfBusinessData;
  customer: PdfCustomerData;
  items: PdfItem[];
}) {
  const accentColor = business.invoice_accent_color || PDF_COLORS.defaultAccent;
  const styles = buildStyles(accentColor);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {business.logo_url ? (
              // react-pdf fetches this URL at render time, so it must be
              // publicly reachable (the Supabase storage bucket is public).
              // eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's Image, not an <img>
              <Image src={business.logo_url} style={styles.logo} />
            ) : null}
            <Text style={styles.businessName}>{business.name || "Your business"}</Text>
            {business.address ? <Text style={styles.small}>{business.address}</Text> : null}
            {business.email ? <Text style={styles.small}>{business.email}</Text> : null}
            {business.phone ? <Text style={styles.small}>{business.phone}</Text> : null}
            {business.tax_number ? (
              <Text style={styles.small}>Tax no: {business.tax_number}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceMeta}>{invoice.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>Issued {invoice.issue_date}</Text>
            {invoice.due_date ? (
              <Text style={styles.invoiceMeta}>Due {invoice.due_date}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Bill to</Text>
          <Text>{customer.name}</Text>
          {customer.address ? <Text style={styles.small}>{customer.address}</Text> : null}
          {customer.email ? <Text style={styles.small}>{customer.email}</Text> : null}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={styles.colDescription}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit price</Text>
            <Text style={styles.colTotal}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View style={styles.tableRow} key={i}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatMoney(item.unit_price, invoice.currency)}</Text>
              <Text style={styles.colTotal}>{formatMoney(item.line_total, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text>{formatMoney(invoice.subtotal, invoice.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Discount</Text>
            <Text>-{formatMoney(invoice.discount_total, invoice.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text>{formatMoney(invoice.tax_total, invoice.currency)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalLabel}>{formatMoney(invoice.total, invoice.currency)}</Text>
          </View>
          {invoice.amount_paid > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Paid</Text>
              <Text>-{formatMoney(invoice.amount_paid, invoice.currency)}</Text>
            </View>
          ) : null}
        </View>

        {invoice.notes ? (
          <View style={styles.notes}>
            <Text style={styles.label}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
