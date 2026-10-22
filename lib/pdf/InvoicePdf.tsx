import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { formatMoney } from "@/lib/invoice-calculations";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#17233b", fontFamily: "Helvetica" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  logo: { width: 100, maxHeight: 60, objectFit: "contain", marginBottom: 8 },
  businessName: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  small: { fontSize: 9, color: "#4a5468", marginBottom: 1 },
  invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: "right" },
  invoiceMeta: { fontSize: 9, color: "#4a5468", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 20 },
  label: { fontSize: 8, color: "#4a5468", textTransform: "uppercase", marginBottom: 3 },
  table: { marginTop: 10, borderTop: "1pt solid #e2e0d8" },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #e2e0d8",
    paddingVertical: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  colDescription: { flex: 4 },
  colQty: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  totalsBlock: { marginTop: 16, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalsLabel: { color: "#4a5468" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
  },
  grandTotalLabel: { fontWeight: 700 },
  notes: { marginTop: 28, fontSize: 9, color: "#4a5468" },
});

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
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  logo_url: string | null;
  invoice_accent_color: string;
};

export type PdfCustomerData = {
  name: string;
  email: string | null;
  address: string | null;
};

export type PdfItem = { description: string; quantity: number; unit_price: number; line_total: number };

function isRenderableLogo(url: string | null): url is string {
  if (!url) return false;
  return !/\.svg(\?|$)/i.test(url);
}

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
  const accent = business.invoice_accent_color || "#2f6f5e";
  const showLogo = isRenderableLogo(business.logo_url);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {showLogo ? (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={business.logo_url as string} style={styles.logo} />
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
            <Text style={[styles.invoiceTitle, { color: accent }]}>INVOICE</Text>
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
          <View style={[styles.tableHeaderRow, { borderBottom: `1pt solid ${accent}` }]}>
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
          <View style={[styles.grandTotalRow, { borderTop: `1pt solid ${accent}` }]}>
            <Text style={[styles.grandTotalLabel, { color: accent }]}>Total</Text>
            <Text style={[styles.grandTotalLabel, { color: accent }]}>
              {formatMoney(invoice.total, invoice.currency)}
            </Text>
          </View>
          {invoice.amount_paid > 0 ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Paid</Text>
              <Text>-{formatMoney(invoice.amount_paid, invoice.currency)}</Text>
            </View>
          ) : null}
        </View>
        </Page>
        </Document>
  );
}