import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import InvoiceDocument, { type InvoiceData } from "@/components/invoice/InvoiceDocument";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not available yet." }, { status: 404 });
  }

  const { orderId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "order_number, created_at, customer_id, customer_name, customer_phone, delivery_address, subtotal, discount, total, advance_amount, payment_status"
    )
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const isStaff = profile?.role === "owner" || profile?.role === "employee";
  const isOwnOrder = order.customer_id === user.id;
  if (!isStaff && !isOwnOrder) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, weight_label, flavour, quantity, unit_price, line_total")
    .eq("order_id", orderId);

  const invoiceData: InvoiceData = {
    orderNumber: order.order_number,
    createdAt: new Date(order.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    deliveryAddress: order.delivery_address,
    items: (items ?? []).map((item) => ({
      name: item.product_name,
      detail: [item.weight_label, item.flavour].filter(Boolean).join(" · "),
      qty: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    advanceAmount: Number(order.advance_amount),
    paymentStatus: order.payment_status,
  };

  const buffer = await renderToBuffer(<InvoiceDocument data={invoiceData} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${order.order_number}.pdf"`,
    },
  });
}
