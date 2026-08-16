import type {
  Order,
  OrderItem,
  OrderWithItems,
  Product,
  ProductNames,
  PushSubscription,
  Review,
  WheelPrize,
} from "./entities";

export type CreateProductInput = {
  name: string;
  nameAr?: string;
  slug: string;
  description: string | null;
  descriptionAr?: string | null;
  price: string | number;
  originalPrice: string | number | null;
  category: string | null;
  imageUrl: string | null;
  images: string[];
  stock: number;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductRepository {
  listTopByViews(limit: number): Promise<Product[]>;
  listByCreatedDesc(): Promise<Product[]>;
  listByCategoryExcluding(
    category: string,
    excludeSlug: string,
    limit: number
  ): Promise<Product[]>;
  listOtherThanCategory(
    category: string,
    excludeSlug: string,
    limit: number
  ): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getById(id: string): Promise<Product | null>;
  getManyByIds(ids: string[]): Promise<Product[]>;
  listSlugs(): Promise<string[]>;
  incrementViews(id: string): Promise<number>;
  namesByIds(ids: string[]): Promise<Record<string, string>>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product | null>;
  remove(id: string): Promise<void>;
  addStock(id: string, quantity: number): Promise<void>;
  removeStock(id: string, quantity: number): Promise<void>;
}

export type OrderItemInput = {
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

export type CreateOrderData = {
  customerName: string;
  customerEmail: string | null;
  phone: string;
  address: string;
  city: string;
  deliveryFee: number;
  discountCode: string | null;
  discountLabel: string | null;
  discountAmount: number;
  totalAmount: number;
};

export interface OrderRepository {
  create(data: CreateOrderData): Promise<Order>;
  createItems(items: OrderItemInput[]): Promise<void>;
  getById(id: string): Promise<Order | null>;
  getByTrackingId(trackingNumber: string): Promise<Order | null>;
  getWithItems(id: string): Promise<OrderWithItems | null>;
  listWithItems(): Promise<OrderWithItems[]>;
  listForStats(): Promise<Order[]>;
  listIdAndEmail(): Promise<{ id: string; customerEmail: string | null }[]>;
  listAllOrderItems(): Promise<
    { productId: string; quantity: number; priceAtPurchase: string | number }[]
  >;
  update(id: string, patch: Partial<Order>): Promise<Order | null>;
  delete(id: string): Promise<void>;
  deleteItems(orderId: string): Promise<void>;
  counts(): Promise<{
    productCount: number;
    orderCount: number;
    pendingOrders: number;
    confirmedOrders: number;
  }>;
}

export interface ReviewRepository {
  listForProduct(productId: string): Promise<Review[]>;
  create(data: {
    productId: string;
    name: string;
    rating: number;
    text: string;
  }): Promise<Review>;
  exists(id: string): Promise<boolean>;
  remove(id: string): Promise<void>;
}

export type CreateWheelPrizeInput = {
  label: string;
  labelAr?: string;
  code: string;
  color: string;
  weight: number;
  active?: boolean;
};

export interface WheelRepository {
  listActive(): Promise<WheelPrize[]>;
  listAll(): Promise<WheelPrize[]>;
  getById(id: string): Promise<WheelPrize | null>;
  getByCode(code: string): Promise<WheelPrize | null>;
  create(data: CreateWheelPrizeInput): Promise<WheelPrize>;
  update(
    id: string,
    data: Partial<CreateWheelPrizeInput>
  ): Promise<WheelPrize | null>;
  remove(id: string): Promise<void>;
}

export type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export interface PushSubscriptionRepository {
  save(sub: PushSubscriptionInput): Promise<void>;
  removeByEndpoint(endpoint: string): Promise<void>;
  removeById(id: string): Promise<void>;
  listAll(): Promise<PushSubscription[]>;
}

export interface SettingsRepository {
  getAdminEmail(): Promise<string | null>;
  setAdminEmail(email: string | null): Promise<void>;
}
