import type { Order, OrderWithItems } from "@/domain/entities";
import type { Locale } from "@/domain/entities";

export interface NotificationPort {
  notifyOrderCreated(
    order: OrderWithItems,
    opts: { locale: Locale; notifyAdmin: boolean; notifyCustomer: boolean }
  ): string | null;
  notifyOrderStatusChanged(order: Order, status: string): string;
  notifyOrderCancelledByCustomer(order: Order, locale: Locale): void;
  notifyBostaStatusChanged(order: Order, status: "delivered" | "cancelled"): void;
  sendTest(opts?: { adminEmail?: string | null }): Promise<{
    push: boolean;
    pushDetail?: string;
    email: boolean;
    emailDetail?: string;
  }>;
}

export type NotificationItem = {
  product: { name: string };
  quantity: number;
  priceAtPurchase: string | number;
};

export type NotificationOrder = {
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
  items: NotificationItem[];
};

export type NotificationSenders = {
  whatsapp: {
    adminNewOrderWhatsApp(order: NotificationOrder): string;
    clientStatusWhatsApp(order: {
      id: string;
      customerName: string;
      phone: string;
      status: string;
    }): string;
  };
  email: {
    adminNewOrderEmail(order: NotificationOrder & { whatsappLink?: string }): Promise<void>;
    adminTestEmail(): Promise<void>;
    clientOrderConfirmationEmail(
      order: NotificationOrder,
      locale?: string
    ): Promise<void>;
    clientOrderEmail(order: {
      id: string;
      customerName: string;
      customerEmail?: string | null;
      status: string;
      totalAmount: string | number;
    }): Promise<void>;
    clientOrderCancelledEmail(
      order: {
        id: string;
        customerName: string;
        customerEmail?: string | null;
        totalAmount: string | number;
      },
      locale?: string
    ): Promise<void>;
  };
  push: {
    pushNewOrderNotification(order: {
      id: string;
      customerName: string;
      totalAmount: string | number;
      items: { product: { name: string }; quantity: number }[];
    }): Promise<void>;
    sendPushToAdmin(payload: {
      title: string;
      body: string;
      url?: string;
    }): Promise<void>;
  };
};

export function createNotificationPort(senders: NotificationSenders): NotificationPort {
  return {
    notifyOrderCreated(order, opts) {
      const fullOrder = order as any;
      const whatsappLink = senders.whatsapp.adminNewOrderWhatsApp(fullOrder);

      if (opts.notifyAdmin) {
        senders.email
          .adminNewOrderEmail({ ...fullOrder, whatsappLink })
          .catch(() => {});
        senders.push.pushNewOrderNotification(fullOrder).catch(() => {});
      }

      if (opts.notifyCustomer && order.customerEmail) {
        senders.email
          .clientOrderConfirmationEmail(fullOrder, opts.locale)
          .catch(() => {});
      }

      return whatsappLink;
    },

    notifyOrderStatusChanged(order, status) {
      senders.email
        .clientOrderEmail({
          id: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          status,
          totalAmount: Number(order.totalAmount),
        })
        .catch(() => {});
      return senders.whatsapp.clientStatusWhatsApp({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        status,
      });
    },

    notifyOrderCancelledByCustomer(order, locale) {
      senders.push
        .sendPushToAdmin({
          title: `Order #${order.id.slice(-6).toUpperCase()} cancelled by customer`,
          body: `${order.customerName} cancelled this order.`,
        })
        .catch(() => {});
      senders.email
        .clientOrderCancelledEmail(
          {
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            totalAmount: order.totalAmount,
          },
          locale
        )
        .catch(() => {});
    },

    notifyBostaStatusChanged(order, status) {
      senders.push
        .sendPushToAdmin({
          title: `Order #${order.id.slice(-6).toUpperCase()} ${
            status === "delivered" ? "delivered" : "cancelled"
          }`,
          body: `${order.customerName} — Bosta ${status} the delivery`,
        })
        .catch(() => {});
    },

    async sendTest(opts) {
      const results: {
        push: boolean;
        pushDetail?: string;
        email: boolean;
        emailDetail?: string;
      } = { push: false, email: false };

      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        await senders.push.sendPushToAdmin({
          title: "🔔 Test notification",
          body: "Push notifications are working! New orders will alert you here.",
          url: "/admin/orders",
        });
        results.push = true;
      } else {
        results.pushDetail = "VAPID keys not configured — push is skipped.";
      }

      const adminEmail = opts?.adminEmail || process.env.ADMIN_EMAIL || "";
      if (adminEmail && process.env.SMTP_USER) {
        await senders.email.adminTestEmail();
        results.email = true;
      } else {
        results.emailDetail = "No admin email configured — email is skipped.";
      }

      return results;
    },
  };
}
