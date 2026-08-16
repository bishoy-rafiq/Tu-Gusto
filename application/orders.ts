import type { Locale, Order, OrderItem, OrderWithItems, Product } from "@/domain/entities";
import { OrderError } from "@/domain/errors";
import { computeOrderTotals, getDeliveryFee, isValidCity, percentFromLabel } from "@/domain/pricing";
import type { OrderRepository, ProductRepository, WheelRepository } from "@/domain/repositories";
import type { BostaService } from "@/domain/services";
import type { NotificationPort } from "./notifications";

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  email?: string | null;
  items: { productId: string; quantity: number }[];
  discountCode?: string | null;
  discountLabel?: string | null;
  discountAmount?: string | number | null;
  requireEmail?: boolean;
  trustedDiscount?: boolean;
};

export type OrderItemWithProduct = OrderItem & { product: Product };

export type CreatedOrder = {
  order: Order;
  items: OrderItemWithProduct[];
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface AdminCreateOrderBody {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  email?: string | null;
  items: { productId: string; quantity: number }[];
  discountCode?: string | null;
  discountLabel?: string | null;
  discountAmount?: string | number | null;
  sendToBosta?: boolean;
  locale?: string;
}

export type BostaActionResult =
  | { ok: true; order: Order }
  | { ok: false; error: string; status: number };

export interface OrderUseCases {
  create(input: CreateOrderInput): Promise<CreatedOrder>;
  submitCheckout(input: CreateOrderInput, ctx: { locale: Locale }): Promise<{ orderId: string }>;
  createFromAdmin(
    body: AdminCreateOrderBody
  ): Promise<{
    orderId: string;
    bosta: { trackingNumber?: string | null; error?: string; skipped?: boolean };
  }>;
  listForAdmin(): Promise<OrderWithItems[]>;
  getForCustomer(id: string, email: string): Promise<OrderWithItems | null>;
  lookup(q: string, email: string): Promise<OrderWithItems | null>;
  cancelByCustomer(id: string, email: string, locale: Locale): Promise<void>;
  updateFromAdmin(
    id: string,
    body: Record<string, any>
  ): Promise<{ order: Order; whatsappLink?: string }>;
  removeFromAdmin(id: string): Promise<void>;
  bostaAction(id: string, action: string): Promise<BostaActionResult>;
  handleBostaWebhook(
    body: Record<string, any>
  ): Promise<{ ok: boolean; error?: string; notFound?: boolean }>;
}

export function createOrderUseCases(deps: {
  orders: OrderRepository;
  products: ProductRepository;
  wheel: WheelRepository;
  notifications: NotificationPort;
  bosta: BostaService;
}): OrderUseCases {
  const { orders, products, wheel, notifications, bosta } = deps;

  async function create(input: CreateOrderInput): Promise<CreatedOrder> {
    const {
      customerName,
      phone,
      address,
      city,
      email,
      items,
      discountCode,
      discountLabel,
      discountAmount,
      requireEmail = true,
      trustedDiscount = false,
    } = input;

    if (!customerName || !phone || !address || !city || !items?.length) {
      throw new OrderError("Missing required fields");
    }
    if (
      typeof customerName !== "string" ||
      customerName.trim().length < 2 ||
      customerName.trim().length > 100
    ) {
      throw new OrderError("Invalid customer name");
    }
    if (
      typeof address !== "string" ||
      address.trim().length < 3 ||
      address.trim().length > 300
    ) {
      throw new OrderError("Invalid address");
    }
    if (typeof city !== "string" || !isValidCity(city)) {
      throw new OrderError("Invalid city");
    }
    if (
      email &&
      (typeof email !== "string" ||
        email.length > 200 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    ) {
      throw new OrderError("Invalid email");
    }
    if (requireEmail && (!email || (typeof email === "string" && !email.trim()))) {
      throw new OrderError("Valid email is required");
    }
    if (!/^[\d\s+\-()]{7,20}$/.test(phone)) {
      throw new OrderError("Invalid phone number");
    }
    if (discountCode && (typeof discountCode !== "string" || discountCode.length > 50)) {
      throw new OrderError("Invalid discount code");
    }
    if (discountLabel && (typeof discountLabel !== "string" || discountLabel.length > 50)) {
      throw new OrderError("Invalid discount label");
    }

    const productIds = items.map((i) => i.productId);
    const fetchedProducts = await products.getManyByIds(productIds);
    const productMap = new Map<string, Product>(fetchedProducts.map((p) => [p.id, p]));

    let serverTotal = 0;
    const validatedItems: OrderItemWithProduct[] = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new OrderError(`Product not found: ${item.productId}`);
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
        throw new OrderError("Invalid quantity");
      }
      if (Number(product.stock) < quantity) {
        throw new OrderError(`Insufficient stock for ${product.name}`);
      }
      const price = Number(product.price);
      serverTotal += price * quantity;
      validatedItems.push({ productId: item.productId, quantity, priceAtPurchase: price, product } as OrderItemWithProduct);
    }

    let requestedDiscount: number | null = null;
    let resolvedDiscountLabel = discountLabel;

    if (trustedDiscount) {
      if (discountAmount !== undefined && discountAmount !== null && discountAmount !== "") {
        requestedDiscount = Number(discountAmount);
      }
    } else if (discountCode) {
      const prize = await wheel.getByCode(discountCode);
      if (prize) {
        resolvedDiscountLabel = prize.label;
        const percent = percentFromLabel(prize.label);
        if (percent != null && percent > 0) {
          requestedDiscount = (serverTotal * percent) / 100;
        }
      }
    }

    const totals = computeOrderTotals({
      subtotal: serverTotal,
      deliveryFee: getDeliveryFee(city),
      requestedDiscount,
    });

    for (const item of validatedItems) {
      await products.removeStock(item.productId, item.quantity);
    }

    let order: Order;
    try {
      order = await orders.create({
        customerName: customerName.trim(),
        customerEmail: email?.trim() || null,
        phone: phone.trim(),
        address: address.trim(),
        city,
        deliveryFee: totals.deliveryFee,
        discountCode: discountCode || null,
        discountLabel: resolvedDiscountLabel || null,
        discountAmount: totals.discount,
        totalAmount: totals.total,
      });
    } catch {
      for (const item of validatedItems) {
        await products.addStock(item.productId, item.quantity).catch(() => {});
      }
      throw new OrderError("Could not create order");
    }

    try {
      await orders.createItems(
        validatedItems.map((v) => ({
          orderId: order.id,
          productId: v.productId,
          quantity: v.quantity,
          priceAtPurchase: Number(v.priceAtPurchase),
        }))
      );
    } catch {
      await orders.delete(order.id);
      for (const item of validatedItems) {
        await products.addStock(item.productId, item.quantity).catch(() => {});
      }
      throw new OrderError("Could not create order items");
    }

    return { order, items: validatedItems };
  }

  return {
    create,

    async submitCheckout(input, ctx) {
      const { order, items } = await create(input);
      const fullOrder = { ...order, items } as OrderWithItems;

      notifications.notifyOrderCreated(fullOrder, {
        locale: ctx.locale,
        notifyAdmin: true,
        notifyCustomer: true,
      });

      if (bosta.enabled) {
        bosta
          .create(
            order,
            items.map((i) => ({ name: i.product.name, quantity: i.quantity }))
          )
          .then(async (result) => {
            if (result.trackingNumber) {
              await orders.update(order.id, { bostaTrackingId: result.trackingNumber });
            }
          })
          .catch((err: Error) => {
            console.error("Bosta create failed:", err.message);
          });
      }

      return { orderId: order.id };
    },

    async createFromAdmin(body) {
      const { order, items } = await create({
        customerName: body.customerName,
        phone: body.phone,
        address: body.address,
        city: body.city,
        email: body.email || null,
        items: body.items,
        discountCode: body.discountCode,
        discountLabel: body.discountLabel,
        discountAmount: body.discountAmount,
        requireEmail: false,
        trustedDiscount: true,
      });

      const fullOrder = { ...order, items } as OrderWithItems;

      const whatsappLink = notifications.notifyOrderCreated(fullOrder, {
        locale: body.locale === "ar" ? "ar" : "en",
        notifyAdmin: false,
        notifyCustomer: Boolean(order.customerEmail),
      });

      let bostaResult: {
        trackingNumber?: string | null;
        error?: string;
        skipped?: boolean;
      };
      if (body.sendToBosta && bosta.enabled) {
        try {
          const result = await bosta.create(
            order,
            items.map((i) => ({ name: i.product.name, quantity: i.quantity }))
          );
          if (result.trackingNumber) {
            await orders.update(order.id, { bostaTrackingId: result.trackingNumber });
          }
          bostaResult = { trackingNumber: result.trackingNumber || null };
        } catch (err) {
          bostaResult = { error: (err as Error).message };
        }
      } else {
        bostaResult = { skipped: !bosta.enabled };
      }

      return { orderId: order.id, bosta: bostaResult };
    },

    listForAdmin: () => orders.listWithItems(),

    async getForCustomer(id, email) {
      const order = await orders.getWithItems(id);
      if (!order) return null;
      const match =
        email.trim().toLowerCase() ===
        (order.customerEmail || "").trim().toLowerCase();
      return match ? order : null;
    },

    async lookup(q, email) {
      const query = q.trim().replace(/^#/, "").toLowerCase();
      const emailNormalized = email.trim().toLowerCase();

      if (!query || !emailNormalized) {
        throw new OrderError("Order number and email are required");
      }
      if (query.length < 6 || query.length > 36) {
        throw new OrderError("Invalid order number");
      }

      const all = await orders.listIdAndEmail();
      const matches = all.filter((o) => {
        const idMatch = UUID_RE.test(query)
          ? o.id.toLowerCase() === query
          : o.id.toLowerCase().endsWith(query);
        const emailMatch =
          (o.customerEmail || "").trim().toLowerCase() === emailNormalized;
        return idMatch && emailMatch;
      });

      if (matches.length === 0) return null;
      return orders.getWithItems(matches[0].id);
    },

    async cancelByCustomer(id, email, locale) {
      const order = await orders.getWithItems(id);
      if (!order) {
        throw new OrderError("Order not found", 404);
      }
      const match =
        email.trim().toLowerCase() ===
        (order.customerEmail || "").trim().toLowerCase();
      if (!match) {
        throw new OrderError("Order not found", 404);
      }
      if (order.status !== "pending") {
        throw new OrderError("Orders can only be cancelled while pending");
      }

      for (const item of order.items ?? []) {
        await products.addStock(item.productId, item.quantity);
      }

      if (order.bostaTrackingId) {
        bosta.cancel(order.bostaTrackingId).catch(() => {});
      }

      await orders.update(id, { status: "cancelled" });

      notifications.notifyOrderCancelledByCustomer(order, locale);
    },

    async updateFromAdmin(id, body) {
      const existing = await orders.getWithItems(id);
      if (!existing) {
        throw new OrderError("Order not found", 404);
      }

      const {
        status,
        customerName,
        phone,
        address,
        city,
        email,
        items,
        discountCode,
        discountLabel,
        discountAmount,
        bostaTrackingId,
      } = body;

      let finalStatus = existing.status;

      const editingItems = Array.isArray(items);

      if (editingItems && status === "cancelled") {
        throw new OrderError("Cannot edit items of a cancelled order");
      }

      if (status && status !== existing.status) {
        finalStatus = status;
        if (status === "cancelled") {
          for (const it of existing.items ?? []) {
            await products.addStock(it.productId, it.quantity);
          }
          if (existing.bostaTrackingId) {
            bosta.cancel(existing.bostaTrackingId).catch(() => {});
          }
        } else if (existing.status === "cancelled") {
          for (const it of existing.items ?? []) {
            await products.removeStock(it.productId, it.quantity);
          }
        }
      }

      let newItems: { productId: string; quantity: number; priceAtPurchase: number }[] | null =
        null;
      let subtotal: number | null = null;

      if (editingItems) {
        const productIds = items.map((i: any) => i.productId);
        const fetched = await products.getManyByIds(productIds);
        const productMap = new Map<string, Product>(fetched.map((p) => [p.id, p]));

        newItems = [];
        let total = 0;
        for (const item of items) {
          const product = productMap.get(item.productId);
          if (!product) {
            throw new OrderError(`Product not found: ${item.productId}`);
          }
          const quantity = Number(item.quantity);
          if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
            throw new OrderError("Invalid quantity");
          }
          const price = Number(product.price);
          total += price * quantity;
          newItems.push({ productId: item.productId, quantity, priceAtPurchase: price });
        }
        subtotal = total;

        const existingMap = new Map<string, number>(
          (existing.items ?? []).map((i) => [i.productId, i.quantity])
        );
        const newMap = new Map<string, number>(newItems.map((i) => [i.productId, i.quantity]));
        const allProductIds = [...new Set([...existingMap.keys(), ...newMap.keys()])];

        // Validate every stock change first so a failure never leaves the
        // inventory partially adjusted.
        for (const pid of allProductIds) {
          const diff = (newMap.get(pid) ?? 0) - (existingMap.get(pid) ?? 0);
          if (diff <= 0) continue;
          const product = productMap.get(pid);
          if (Number(product?.stock ?? 0) < diff) {
            throw new OrderError(`Insufficient stock for ${product?.name ?? pid}`);
          }
        }

        for (const pid of allProductIds) {
          const diff = (newMap.get(pid) ?? 0) - (existingMap.get(pid) ?? 0);
          if (diff === 0) continue;
          if (diff > 0) {
            await products.removeStock(pid, diff);
          } else {
            await products.addStock(pid, -diff);
          }
        }
      } else if (
        customerName !== undefined ||
        phone !== undefined ||
        address !== undefined ||
        city !== undefined ||
        email !== undefined ||
        discountAmount !== undefined ||
        discountCode !== undefined ||
        discountLabel !== undefined
      ) {
        subtotal =
          Number(existing.totalAmount) -
          Number(existing.deliveryFee) +
          Number(existing.discountAmount);
      }

      const finalCity = city !== undefined ? city : existing.city;
      if (typeof finalCity !== "string" || !isValidCity(finalCity)) {
        throw new OrderError("Invalid city");
      }

      const patch: Partial<Order> = {};
      if (status) patch.status = finalStatus as Order["status"];
      if (bostaTrackingId !== undefined) patch.bostaTrackingId = bostaTrackingId;

      if (customerName !== undefined) {
        if (
          typeof customerName !== "string" ||
          customerName.trim().length < 2 ||
          customerName.trim().length > 100
        ) {
          throw new OrderError("Invalid customer name");
        }
        patch.customerName = customerName.trim();
      }
      if (phone !== undefined) {
        if (!/^[\d\s+\-()]{7,20}$/.test(phone)) {
          throw new OrderError("Invalid phone number");
        }
        patch.phone = phone.trim();
      }
      if (address !== undefined) {
        if (
          typeof address !== "string" ||
          address.trim().length < 3 ||
          address.trim().length > 300
        ) {
          throw new OrderError("Invalid address");
        }
        patch.address = address.trim();
      }
      if (email !== undefined) {
        if (
          email &&
          (typeof email !== "string" ||
            email.length > 200 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
        ) {
          throw new OrderError("Invalid email");
        }
        patch.customerEmail = (email as string)?.trim() || null;
      }
      if (city !== undefined) patch.city = finalCity;

      if (subtotal !== null) {
        const newFee = getDeliveryFee(finalCity);
        const requestedDiscount =
          discountAmount !== undefined ? discountAmount : existing.discountAmount;
        const totals = computeOrderTotals({
          subtotal,
          deliveryFee: newFee,
          requestedDiscount,
        });
        patch.deliveryFee = totals.deliveryFee;
        patch.discountAmount = totals.discount;
        patch.totalAmount = totals.total;
        if (discountCode !== undefined) patch.discountCode = discountCode || null;
        if (discountLabel !== undefined) patch.discountLabel = discountLabel || null;
      }

      if (editingItems && newItems) {
        await orders.deleteItems(id);
        await orders.createItems(
          newItems.map((v) => ({ orderId: id, ...v }))
        );
      }

      if (Object.keys(patch).length > 0) {
        await orders.update(id, patch);
      }

      const updated = await orders.getById(id);
      if (!updated) {
        throw new OrderError("Order not found", 404);
      }

      if (status && status !== existing.status && ["confirmed", "shipped", "delivered"].includes(status)) {
        const whatsappLink = notifications.notifyOrderStatusChanged(updated, status);
        return { order: updated, whatsappLink };
      }

      return { order: updated };
    },

    async removeFromAdmin(id) {
      const order = await orders.getWithItems(id);
      if (!order) {
        throw new OrderError("Order not found", 404);
      }

      if (order.bostaTrackingId) {
        bosta.cancel(order.bostaTrackingId).catch(() => {});
      }

      if (["pending", "confirmed"].includes(order.status)) {
        for (const it of order.items ?? []) {
          await products.addStock(it.productId, it.quantity);
        }
      }

      await orders.deleteItems(id);
      await orders.delete(id);
    },

    async bostaAction(id, action) {
      const order = await orders.getById(id);
      if (!order) {
        return { ok: false, error: "Order not found", status: 404 };
      }

      if (action === "cancel") {
        if (!order.bostaTrackingId) {
          return { ok: false, error: "No Bosta delivery to cancel", status: 400 };
        }
        const ok = await bosta.cancel(order.bostaTrackingId);
        if (!ok) {
          return { ok: false, error: "Could not cancel Bosta delivery", status: 502 };
        }
        const updated = await orders.getById(id);
        return { ok: true, order: updated! };
      }

      if (order.bostaTrackingId) {
        return { ok: false, error: "Already sent to Bosta", status: 400 };
      }

      try {
        const withItems = await orders.getWithItems(id);
        const items = (withItems?.items ?? []).map((i) => ({
          name: i.product?.name || "Item",
          quantity: i.quantity,
        }));
        const result = await bosta.create(order, items);
        await orders.update(id, { bostaTrackingId: result.trackingNumber });
        const updated = await orders.getById(id);
        return { ok: true, order: updated! };
      } catch (err) {
        return { ok: false, error: (err as Error).message, status: 502 };
      }
    },

    async handleBostaWebhook(body) {
      const businessReference = body.businessReference || body.orderId || "";
      const trackingNumber = body.trackingNumber || body.tracking || "";
      const stateRaw =
        body.state?.value || body.state || body.status || body.stateName || "";

      let order = null;
      if (businessReference) {
        order = await orders.getById(businessReference);
      }
      if (!order && trackingNumber) {
        order = await orders.getByTrackingId(trackingNumber);
      }
      if (!order) {
        return { ok: false, error: "Order not found", notFound: true };
      }

      const state = (stateRaw || "").toLowerCase();
      let mappedStatus: "delivered" | "cancelled" | null = null;
      if (state.includes("deliver")) mappedStatus = "delivered";
      else if (
        state.includes("cancel") ||
        state.includes("terminat") ||
        state.includes("return")
      )
        mappedStatus = "cancelled";

      const patch: Partial<Order> = {};
      if (mappedStatus) patch.status = mappedStatus;
      if (trackingNumber && !order.bostaTrackingId)
        patch.bostaTrackingId = trackingNumber;

      if (Object.keys(patch).length > 0) {
        await orders.update(order.id, patch);
      }

      if (mappedStatus === "cancelled" && order.status !== "cancelled") {
        const withItems = await orders.getWithItems(order.id);
        for (const it of withItems?.items ?? []) {
          await products.addStock(it.productId, it.quantity);
        }
      }

      if (mappedStatus) {
        notifications.notifyBostaStatusChanged(order, mappedStatus);
      }

      return { ok: true };
    },
  };
}
