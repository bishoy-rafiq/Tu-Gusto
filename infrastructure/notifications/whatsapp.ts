const ADMIN_PHONE = process.env.ADMIN_WHATSAPP_PHONE || "+201000000000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function whatsappUrl(phone: string, text: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, "");
  return `https://wa.me/${cleaned.replace("+", "")}?text=${encodeURIComponent(text)}`;
}

export function adminNewOrderWhatsApp(order: {
  id: string;
  customerName: string;
  phone: string;
  city: string;
  totalAmount: string | number;
  items: {
    product: { name: string };
    quantity: number;
    priceAtPurchase: string | number;
  }[];
}) {
  const itemsList = order.items
    .map((i) => `  • ${i.product.name} × ${i.quantity} — ${i.priceAtPurchase} EGP`)
    .join("\n");

  const text = [
    `🛒 *New Order — ${order.id.slice(-6).toUpperCase()}`,

    `👤 ${order.customerName} · ${order.phone}`,
    `📍 ${order.city}`,
    `💰 ${order.totalAmount} EGP (COD)`,
    ``,
    itemsList,
    ``,
    `🔗 ${SITE_URL}/admin/orders`,
  ].join("\n");

  return whatsappUrl(ADMIN_PHONE, text);
}

export function clientStatusWhatsApp(order: {
  id: string;
  customerName: string;
  phone: string;
  status: string;
}) {
  const statusMessages: Record<string, string> = {
    confirmed: `✅ Hi ${order.customerName}! Your order #${order.id.slice(-6).toUpperCase()} has been *confirmed* and is being prepared.`,
    shipped: `🚚 Hi ${order.customerName}! Your order #${order.id.slice(-6).toUpperCase()} has been *shipped*! You'll receive it soon.`,
    delivered: `📦 Hi ${order.customerName}! Your order #${order.id.slice(-6).toUpperCase()} has been *delivered*. Enjoy your coffee!`,
  };

  const text =
    statusMessages[order.status] ||
    `📋 Hi ${order.customerName}! Your order #${order.id.slice(-6).toUpperCase()} status: *${order.status}*.`;
  return whatsappUrl(order.phone, text);
}
