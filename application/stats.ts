import type { OrderRepository, ProductRepository } from "@/domain/repositories";

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

export interface AdminStats {
  productCount: number;
  orderCount: number;
  pendingOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  recentOrders: OrderStat[];
  topProducts: TopProduct[];
}

interface OrderStat {
  id: string;
  customerName: string;
  city: string;
  totalAmount: string | number;
  status: string;
  createdAt?: string;
  discountCode: string | null;
  discountLabel: string | null;
}

export function createStatsUseCases(deps: {
  orders: OrderRepository;
  products: ProductRepository;
}) {
  return {
    async get(): Promise<AdminStats> {
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const counts = await deps.orders.counts();
      const allOrders = await deps.orders.listForStats();

      const totalRevenue = allOrders.reduce(
        (s, o) => s + (o.status === "cancelled" ? 0 : Number(o.totalAmount || 0)),
        0
      );
      const todayOrdersList = allOrders.filter(
        (o) => o.createdAt && new Date(o.createdAt) >= todayStart
      );
      const todayRevenue = todayOrdersList.reduce(
        (s: number, o) => s + (o.status === "cancelled" ? 0 : Number(o.totalAmount || 0)),
        0
      );
      const recentOrders = allOrders.slice(0, 8) as OrderStat[];

      const allItems = await deps.orders.listAllOrderItems();
      const agg = new Map<string, { qty: number; rev: number }>();
      for (const it of allItems) {
        const cur = agg.get(it.productId) ?? { qty: 0, rev: 0 };
        cur.qty += it.quantity;
        cur.rev += Number(it.priceAtPurchase || 0) * it.quantity;
        agg.set(it.productId, cur);
      }

      const topRows = [...agg.entries()]
        .sort((a, b) => b[1].qty - a[1].qty)
        .slice(0, 5);
      const productIds = topRows.map(([id]) => id);
      const productMap = await deps.products.namesByIds(productIds);

      const topProducts: TopProduct[] = topRows.map(([id, v]) => ({
        name: productMap[id] || "Unknown",
        sold: v.qty,
        revenue: v.rev,
      }));

      return {
        productCount: counts.productCount,
        orderCount: counts.orderCount,
        pendingOrders: counts.pendingOrders,
        confirmedOrders: counts.confirmedOrders,
        totalRevenue,
        todayOrders: todayOrdersList.length,
        todayRevenue,
        recentOrders,
        topProducts,
      };
    },
  };
}
