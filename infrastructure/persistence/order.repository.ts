import { supabase } from "./supabase";
import type { Order, OrderItem, OrderWithItems } from "@/domain/entities";
import type {
  CreateOrderData,
  OrderItemInput,
  OrderRepository,
} from "@/domain/repositories";

function toOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customerName,
    customerEmail: row.customerEmail ?? null,
    phone: row.phone,
    address: row.address,
    city: row.city,
    status: row.status,
    bostaTrackingId: row.bostaTrackingId ?? null,
    totalAmount: row.totalAmount,
    deliveryFee: row.deliveryFee,
    discountCode: row.discountCode ?? null,
    discountLabel: row.discountLabel ?? null,
    discountAmount: row.discountAmount,
    createdAt: row.createdAt,
  };
}

function toOrderItem(row: any): OrderItem {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    quantity: row.quantity,
    priceAtPurchase: row.priceAtPurchase,
    product: row.product ?? null,
  };
}

export const supabaseOrderRepository: OrderRepository = {
  async create(data: CreateOrderData) {
    const { data: order, error } = await supabase
      .from("orders")
      .insert(data)
      .select("*")
      .single();
    if (error || !order) throw new Error("Could not create order");
    return toOrder(order);
  },

  async createItems(items: OrderItemInput[]) {
    const { error } = await supabase.from("order_items").insert(items);
    if (error) throw new Error("Could not create order items");
  },

  async getById(id) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? toOrder(data) : null;
  },

  async getByTrackingId(trackingNumber) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("bostaTrackingId", trackingNumber)
      .maybeSingle();
    return data ? toOrder(data) : null;
  },

  async getWithItems(id) {
    const { data } = await supabase
      .from("orders")
      .select(
        "*, items:order_items(product:products(name, name_ar, stock), productId, quantity, priceAtPurchase)"
      )
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return { ...toOrder(data), items: (data.items ?? []).map(toOrderItem) };
  },

  async listWithItems() {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*, products(*))")
      .order("createdAt", { ascending: false });

    return (data ?? []).map((row: any) => {
      const items = (row.order_items ?? []).map((oi: any) => {
        const { products, ...rest } = oi;
        return { ...rest, product: products ?? null };
      });
      const { order_items, ...order } = row;
      return { ...toOrder(order), items: items.map(toOrderItem) };
    });
  },

  async listForStats() {
    const { data } = await supabase
      .from("orders")
      .select(
        "id, customerName, city, totalAmount, status, createdAt, discountCode, discountLabel"
      )
      .order("createdAt", { ascending: false });
    return (data ?? []).map(toOrder);
  },

  async listIdAndEmail() {
    const { data } = await supabase
      .from("orders")
      .select("id, customerEmail")
      .order("createdAt", { ascending: false });
    return (data ?? []).map((o: any) => ({
      id: o.id,
      customerEmail: o.customerEmail ?? null,
    }));
  },

  async listAllOrderItems() {
    const { data } = await supabase
      .from("order_items")
      .select("productId, quantity, priceAtPurchase");
    return (data ?? []).map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity ?? 0,
      priceAtPurchase: i.priceAtPurchase,
    }));
  },

  async update(id, patch) {
    const { data, error } = await supabase
      .from("orders")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error || !data) return null;
    return toOrder(data);
  },

  async delete(id) {
    await supabase.from("orders").delete().eq("id", id);
  },

  async deleteItems(orderId) {
    await supabase.from("order_items").delete().eq("orderId", orderId);
  },

  async counts() {
    const { count: productCount } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true });
    const { count: orderCount } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });
    const { count: pendingOrders } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    const { count: confirmedOrders } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed");
    return {
      productCount: productCount ?? 0,
      orderCount: orderCount ?? 0,
      pendingOrders: pendingOrders ?? 0,
      confirmedOrders: confirmedOrders ?? 0,
    };
  },
};
