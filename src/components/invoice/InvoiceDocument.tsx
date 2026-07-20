import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { business } from "@/data/business";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#2b1a15" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  brand: { fontSize: 20, fontWeight: 700, color: "#894e3f" },
  tagline: { fontSize: 9, color: "#c37960", marginTop: 2 },
  receiptTitle: { fontSize: 14, fontWeight: 700, textAlign: "right" },
  meta: { fontSize: 9, color: "#555", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 8, textTransform: "uppercase", color: "#888", marginBottom: 4, letterSpacing: 1 },
  row: { flexDirection: "row" },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #894e3f",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottom: "0.5 solid #e5d5b8",
  },
  colName: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  thText: { fontSize: 8, textTransform: "uppercase", color: "#888" },
  totalsBlock: { marginTop: 16, alignItems: "flex-end" },
  totalsRow: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 4 },
  grandTotal: { fontWeight: 700, fontSize: 12, color: "#894e3f" },
  footer: { marginTop: 40, paddingTop: 12, borderTop: "0.5 solid #e5d5b8", fontSize: 8, color: "#888", textAlign: "center" },
});

export type InvoiceData = {
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: { name: string; detail: string; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  total: number;
  advanceAmount: number;
  paymentStatus: string;
};

export default function InvoiceDocument({ data }: { data: InvoiceData }) {
  const balanceDue = Math.max(0, data.total - data.advanceAmount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>{business.name}</Text>
            <Text style={styles.tagline}>{business.subBrand}</Text>
            <Text style={styles.tagline}>{business.tagline}</Text>
          </View>
          <View>
            <Text style={styles.receiptTitle}>ORDER RECEIPT</Text>
            <Text style={styles.meta}>#{data.orderNumber}</Text>
            <Text style={styles.meta}>{data.createdAt}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Billed To</Text>
          <Text>{data.customerName}</Text>
          <Text>{data.customerPhone}</Text>
          <Text>{data.deliveryAddress}</Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.colName, styles.thText]}>Item</Text>
          <Text style={[styles.colQty, styles.thText]}>Qty</Text>
          <Text style={[styles.colPrice, styles.thText]}>Price</Text>
          <Text style={[styles.colTotal, styles.thText]}>Total</Text>
        </View>
        {data.items.map((item, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={styles.colName}>
              <Text>{item.name}</Text>
              {item.detail && <Text style={{ fontSize: 8, color: "#888" }}>{item.detail}</Text>}
            </View>
            <Text style={styles.colQty}>{item.qty}</Text>
            <Text style={styles.colPrice}>₹{item.unitPrice}</Text>
            <Text style={styles.colTotal}>₹{item.lineTotal}</Text>
          </View>
        ))}

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>₹{data.subtotal}</Text>
          </View>
          {data.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text>Discount</Text>
              <Text>-₹{data.discount}</Text>
            </View>
          )}
          <View style={styles.totalsRow}>
            <Text style={styles.grandTotal}>Total</Text>
            <Text style={styles.grandTotal}>₹{data.total}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Advance / Paid</Text>
            <Text>₹{data.advanceAmount}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Balance Due</Text>
            <Text>₹{balanceDue}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>
            {business.phones.join(" · ")} · {business.website}
          </Text>
          <Text>Thank you for your order! This is a system-generated receipt, not a GST tax invoice.</Text>
        </View>
      </Page>
    </Document>
  );
}
