import nodemailer from "nodemailer";
import { supabaseSettingsRepository } from "@/infrastructure/persistence/settings.repository";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function getAdminEmail(): Promise<string> {
  try {
    return (await supabaseSettingsRepository.getAdminEmail()) || process.env.ADMIN_EMAIL || "";
  } catch {
    return process.env.ADMIN_EMAIL || "";
  }
}

const BRAND = {
  espresso: "#141009",
  gold: "#C6A05C",
  tan: "#E3C995",
  rust: "#C6783F",
  surface: "#251E16",
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const smtp = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.SMTP_USER) return;
  await smtp.sendMail({
    from: `"Tu Gusto" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export async function adminTestEmail() {
  const ADMIN_EMAIL = await getAdminEmail();
  if (!ADMIN_EMAIL) return;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;background:${BRAND.espresso}">
      <div style="background:${BRAND.espresso};padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">Tu Gusto</h1>
        <p style="color:${BRAND.gold};margin:6px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase">Test Notification</p>
      </div>
      <div style="padding:24px;background:#1E1812;border:1px solid #2E261C;border-radius:0 0 12px 12px;text-align:center">
        <p style="color:#F1E8DB;font-size:15px;margin:0">Everything is working! ✅</p>
        <p style="color:#A0907F;font-size:13px;margin:10px 0 0">Email notifications are configured and sending correctly. You'll now receive new-order emails to <strong style="color:#F1E8DB">${ADMIN_EMAIL}</strong>.</p>
      </div>
    </div>`;
  await sendEmail(ADMIN_EMAIL, "✅ Tu Gusto test notification", html);
}

export async function adminNewOrderEmail(order: {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  phone: string;
  address: string;
  city: string;
  totalAmount: string | number;
  deliveryFee: string | number;
  discountCode: string | null;
  discountAmount: string | number;
  items: {
    product: { name: string };
    quantity: number;
    priceAtPurchase: string | number;
  }[];
  whatsappLink?: string;
}) {
  const ADMIN_EMAIL = await getAdminEmail();
  if (!ADMIN_EMAIL) return;

  const itemsRows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #2E261C;color:#F1E8DB">${esc(i.product.name)}</td><td style="padding:8px 12px;border-bottom:1px solid #2E261C;color:#A0907F;text-align:center">${esc(i.quantity)}</td><td style="padding:8px 12px;border-bottom:1px solid #2E261C;color:#F1E8DB;text-align:right">${esc(i.priceAtPurchase)} EGP</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:${BRAND.espresso}">
      <div style="background:${BRAND.espresso};padding:24px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:20px">🛒 New Order #${esc(order.id.slice(-6).toUpperCase())}</h1>
      </div>
      <div style="padding:24px;background:#1E1812;border:1px solid #2E261C">
        <p style="color:#F1E8DB;margin:0"><strong>Customer:</strong> ${esc(order.customerName)}</p>
        ${order.customerEmail ? `<p style="color:#A0907F;margin:6px 0 0">Email: ${esc(order.customerEmail)}</p>` : ""}
        <p style="color:#A0907F;margin:6px 0 0">Phone: ${esc(order.phone)}</p>
        <p style="color:#A0907F;margin:6px 0 0">City: ${esc(order.city)}</p>
        <p style="color:#A0907F;margin:6px 0 0">Address: ${esc(order.address)}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <thead><tr style="background:#251E16"><th style="padding:8px 12px;text-align:left;color:${BRAND.gold}">Product</th><th style="padding:8px 12px;color:${BRAND.gold}">Qty</th><th style="padding:8px 12px;text-align:right;color:${BRAND.gold}">Price</th></tr></thead>
          <tbody>${itemsRows}</tbody>
        </table>
        <hr style="border:none;border-top:1px solid #2E261C"/>
        <p style="color:#A0907F"><strong style="color:#F1E8DB">Subtotal:</strong> ${(Number(order.totalAmount) - Number(order.deliveryFee) + Number(order.discountAmount)).toFixed(2)} EGP</p>
        <p style="color:#A0907F"><strong style="color:#F1E8DB">Delivery:</strong> ${esc(order.deliveryFee)} EGP</p>
        ${order.discountCode ? `<p style="color:#67C23A"><strong>Discount (${esc(order.discountCode)}):</strong> -${esc(order.discountAmount)} EGP</p>` : ""}
        <p style="font-size:18px;font-weight:bold;color:${BRAND.gold}">Total: ${esc(order.totalAmount)} EGP (COD)</p>
        <a href="${SITE_URL}/admin/orders" style="display:inline-block;background:${BRAND.gold};color:${BRAND.espresso};padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:8px;font-weight:600">View in Admin</a>
        ${order.whatsappLink ? `<a href="${esc(order.whatsappLink)}" style="display:inline-block;background:#25D366;color:#141009;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:8px;font-weight:600">WhatsApp Alert</a>` : ""}
      </div>
    </div>`;

  await sendEmail(
    ADMIN_EMAIL,
    `🛒 New Order #${esc(order.id.slice(-6).toUpperCase())} — ${esc(order.totalAmount)} EGP`,
    html
  );
}

export async function clientOrderConfirmationEmail(
  order: {
    id: string;
    customerName: string;
    customerEmail?: string | null;
    city: string;
    totalAmount: string | number;
    deliveryFee: string | number;
    discountCode: string | null;
    discountAmount: string | number;
    items: {
      product: { name: string; name_ar?: string | null };
      quantity: number;
      priceAtPurchase: string | number;
    }[];
  },
  locale: string = "en"
) {
  if (!order.customerEmail) return;

  const isAr = locale === "ar";
  const t = isAr
    ? {
        eyebrow: "تم تأكيد طلبك",
        hi: "مرحبًا",
        thanks: "شكرًا لطلبك! نحن نجهز كل شيء من أجلك.",
        orderNumber: "رقم الطلب",
        subtotal: "المجموع الفرعي",
        deliveryTo: "التوصيل إلى",
        discount: "الخصم",
        total: "الإجمالي",
        cod: "الدفع عند الاستلام. سنرسل لك إيميل بمجرد أن يكون طلبك في الطريق.",
        footer: "أهلاً بك في Tu Gusto — تجربة قهوة فاخرة",
        visit: "تصفح المتجر",
        subject: `تأكيد طلبك من Tu Gusto #${order.id.slice(-6).toUpperCase()}`,
      }
    : {
        eyebrow: "Order Confirmed",
        hi: "Hi",
        thanks: "Thank you for your order! We're getting everything ready for you.",
        orderNumber: "Order number",
        subtotal: "Subtotal",
        deliveryTo: "Delivery to",
        discount: "Discount",
        total: "Total",
        cod: "Payment is cash on delivery. We'll email you again as soon as your order is on its way.",
        footer: "Tu Gusto — Premium Coffee Experience",
        visit: "Visit our store",
        subject: `Your Tu Gusto order #${order.id.slice(-6).toUpperCase()} is confirmed`,
      };

  const itemsRows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid #2E261C;color:#F1E8DB">${esc(isAr ? (i.product.name_ar || i.product.name) : i.product.name)}</td><td style="padding:10px 12px;border-bottom:1px solid #2E261C;color:#A0907F;text-align:center">× ${esc(i.quantity)}</td><td style="padding:10px 12px;border-bottom:1px solid #2E261C;color:#F1E8DB;text-align:right">${esc(i.priceAtPurchase)} EGP</td></tr>`
    )
    .join("");

  const subtotal =
    Number(order.totalAmount) - Number(order.deliveryFee) + Number(order.discountAmount);

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#141009;direction:${isAr ? "rtl" : "ltr"}">
      <div style="background:${BRAND.espresso};padding:32px 32px 24px;text-align:center">
        <h1 style="color:#fff;margin:0 0 4px;font-size:22px;letter-spacing:0.02em">Tu Gusto</h1>
        <p style="color:${BRAND.gold};margin:0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase">${t.eyebrow}</p>
      </div>
      <div style="padding:24px 32px;background:#1E1812;border:1px solid #2E261C;border-radius:0 0 16px 16px">
        <p style="color:#F1E8DB;font-size:15px;margin:0 0 4px">${t.hi} <strong>${esc(order.customerName)}</strong>,</p>
        <p style="color:#A0907F;font-size:14px;margin:0 0 20px">${t.thanks}</p>

        <div style="background:#251E16;border:1px solid #2E261C;border-radius:12px;padding:14px 18px;margin-bottom:20px">
          <p style="color:#A0907F;font-size:12px;margin:0 0 4px">${t.orderNumber}</p>
          <p style="color:${BRAND.gold};font-size:20px;font-weight:bold;margin:0">#${esc(order.id.slice(-6).toUpperCase())}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:8px">
          <tbody>${itemsRows}</tbody>
        </table>

        <div style="border-top:1px solid #2E261C;padding-top:16px;margin-top:8px">
          <p style="color:#A0907F;font-size:14px;margin:4px 0;display:flex;justify-content:space-between"><span>${t.subtotal}</span><span style="color:#F1E8DB">${subtotal.toFixed(2)} EGP</span></p>
          <p style="color:#A0907F;font-size:14px;margin:4px 0;display:flex;justify-content:space-between"><span>${t.deliveryTo} ${esc(order.city)}</span><span style="color:#F1E8DB">${esc(order.deliveryFee)} EGP</span></p>
          ${order.discountCode ? `<p style="color:#67C23A;font-size:14px;margin:4px 0;display:flex;justify-content:space-between"><span>${t.discount} (${esc(order.discountCode)})</span><span style="color:#67C23A">-${esc(order.discountAmount)} EGP</span></p>` : ""}
          <p style="color:#F1E8DB;font-size:18px;font-weight:bold;margin:12px 0 0;display:flex;justify-content:space-between;border-top:1px solid #2E261C;padding-top:14px"><span>${t.total}</span><span>${esc(order.totalAmount)} EGP</span></p>
        </div>

        <p style="color:#A0907F;font-size:12px;margin:20px 0 0;line-height:1.6">${t.cod}</p>
        <div style="text-align:center;margin:22px 0 4px">
          <a href="${SITE_URL}/${locale === "ar" ? "ar" : "en"}/orders/${order.id}?e=${encodeURIComponent(order.customerEmail)}" style="display:inline-block;background:${BRAND.gold};color:${BRAND.espresso};text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:bold;font-size:14px">${isAr ? "إدارة طلبي (تعديل / إلغاء)" : "Manage my order (edit / cancel)"}</a>
        </div>
        <hr style="border:none;border-top:1px solid #2E261C;margin:22px 0"/>
        <p style="color:#6B5D4D;font-size:11px;text-align:center;margin:0">${t.footer} · <a href="${SITE_URL}" style="color:${BRAND.gold};text-decoration:none">${t.visit}</a></p>
      </div>
    </div>`;

  await sendEmail(order.customerEmail, t.subject, html);
}

export async function clientOrderEmail(order: {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  status: string;
  totalAmount: string | number;
}) {
  if (!order.customerEmail) return;
  const colorMap: Record<string, string> = {
    confirmed: "#27ae60",
    shipped: "#2980b9",
    delivered: "#8e44ad",
  };
  const labelMap: Record<string, string> = {
    confirmed: "Order Confirmed ✅",
    shipped: "Order Shipped 🚚",
    delivered: "Order Delivered 📦",
  };
  const arLabelMap: Record<string, string> = {
    confirmed: "تم تأكيد طلبك ✅",
    shipped: "تم شحن طلبك 🚚",
    delivered: "تم تسليم طلبك 📦",
  };
  const arBodyMap: Record<string, string> = {
    confirmed: "تم تأكيد طلبك وجاري تجهيزه.",
    shipped: "تم شحن طلبك! ستصلك في أقرب وقت.",
    delivered: "تم تسليم طلبك. استمتع بقهوتك!",
  };

  const subject =
    labelMap[order.status] || `Order Update — #${order.id.slice(-6).toUpperCase()}`;
  const color = colorMap[order.status] || "#3D2B1F";
  const arLabel = arLabelMap[order.status] || "تحديث الطلب";
  const arBody = arBodyMap[order.status] || `حالة طلبك الآن: ${order.status}.`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;direction:rtl">
      <div style="background:${color};padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">${arLabel}</h1>
      </div>
      <div style="padding:24px;background:#1E1812;border:1px solid #2E261C;text-align:center">
        <p style="font-size:16px;color:#F1E8DB">مرحبًا <strong>${esc(order.customerName)}</strong>,</p>
        <p style="font-size:15px;color:#A0907F">طلبك <strong>#${esc(order.id.slice(-6).toUpperCase())}</strong> — ${arBody}</p>
        <p style="font-size:14px;color:#888;margin-top:24px">الإجمالي: <strong style="color:#F1E8DB">${esc(order.totalAmount)} EGP</strong> (الدفع عند الاستلام)</p>
        <hr style="border:none;border-top:1px solid #2E261C;margin:20px 0"/>
        <p style="font-size:12px;color:#6B5D4D">${arLabel} · ${labelMap[order.status] || subject}</p>
        <p style="font-size:11px;color:#6B5D4D">Tu Gusto — تجربة قهوة فاخرة</p>
      </div>
    </div>`;

  await sendEmail(order.customerEmail, subject, html);
}

export async function clientOrderCancelledEmail(
  order: {
    id: string;
    customerName: string;
    customerEmail?: string | null;
    totalAmount: string | number;
  },
  locale: string = "en"
) {
  if (!order.customerEmail) return;

  const isAr = locale === "ar";
  const t = isAr
    ? {
        subject: `تم إلغاء طلبك من Tu Gusto #${order.id.slice(-6).toUpperCase()}`,
        label: "تم إلغاء الطلب",
        hi: "مرحبًا",
        body: `تم إلغاء طلبك رقم #${order.id.slice(-6).toUpperCase()}. إذا كان هذا خطأ، يرجى الاتصال بنا وسنعيد تفعيله لك.`,
        total: "الإجمالي",
        footer: "Tu Gusto — تجربة قهوة فاخرة",
      }
    : {
        subject: `Your Tu Gusto order #${order.id.slice(-6).toUpperCase()} was cancelled`,
        label: "Order Cancelled",
        hi: "Hi",
        body: `Your order #${order.id.slice(-6).toUpperCase()} has been cancelled. If this was a mistake, please contact us and we'll reactivate it.`,
        total: "Total",
        footer: "Tu Gusto — Premium Coffee Experience",
      };

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;background:#141009;direction:${isAr ? "rtl" : "ltr"}">
      <div style="background:${BRAND.espresso};padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">Tu Gusto</h1>
        <p style="color:${BRAND.gold};margin:6px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase">${t.label}</p>
      </div>
      <div style="padding:24px;background:#1E1812;border:1px solid #2E261C;border-radius:0 0 12px 12px">
        <p style="color:#F1E8DB;font-size:15px;margin:0 0 4px">${t.hi} <strong>${esc(order.customerName)}</strong>,</p>
        <p style="color:#A0907F;font-size:14px;margin:0 0 20px">${t.body}</p>
        <p style="color:#F1E8DB;font-size:16px;font-weight:bold;margin:0 0 20px">${t.total}: ${esc(order.totalAmount)} EGP</p>
        <hr style="border:none;border-top:1px solid #2E261C;margin:18px 0"/>
        <p style="color:#6B5D4D;font-size:11px;text-align:center;margin:0">${t.footer}</p>
      </div>
    </div>`;

  await sendEmail(order.customerEmail, t.subject, html);
}

export async function adminRestockRequestEmail(info: {
  productName: string;
  customerEmail: string;
}) {
  const ADMIN_EMAIL = await getAdminEmail();
  if (!ADMIN_EMAIL) return;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:500px;margin:0 auto;background:${BRAND.espresso}">
      <div style="background:${BRAND.espresso};padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:20px">Tu Gusto</h1>
        <p style="color:${BRAND.gold};margin:6px 0 0;font-size:13px;letter-spacing:0.2em;text-transform:uppercase">Restock Request</p>
      </div>
      <div style="padding:24px;background:#1E1812;border:1px solid #2E261C;border-radius:0 0 12px 12px">
        <p style="color:#F1E8DB;font-size:15px;margin:0 0 10px">A customer asked to be notified when <strong>${esc(info.productName)}</strong> is back in stock.</p>
        <p style="color:#A0907F;font-size:14px;margin:0">Customer email: <strong style="color:#F1E8DB">${esc(info.customerEmail)}</strong></p>
        <p style="color:#A0907F;font-size:12px;margin:14px 0 0">Restock the product and let them know it's available again.</p>
      </div>
    </div>`;

  await sendEmail(ADMIN_EMAIL, "📦 Restock request", html);
}
