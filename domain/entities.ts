export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Locale = "en" | "ar";

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string | null;
  descriptionAr: string | null;
  price: string | number;
  originalPrice: string | number | null;
  category: string | null;
  imageUrl: string | null;
  images: string[];
  stock: number;
  views: number;
  createdAt?: string;
}

export interface ProductNames {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: string | number;
  product?: Pick<Product, "name" | "stock"> | Product | null;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string | null;
  phone: string;
  address: string;
  city: string;
  status: OrderStatus;
  bostaTrackingId: string | null;
  totalAmount: string | number;
  deliveryFee: string | number;
  discountCode: string | null;
  discountLabel: string | null;
  discountAmount: string | number;
  createdAt?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  text: string;
  createdAt?: string;
}

export interface WheelPrize {
  id: string;
  label: string;
  labelAr: string;
  code: string;
  color: string;
  weight: number;
  active: boolean;
  createdAt?: string;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  createdAt?: string;
}

export interface CityDelivery {
  name: string;
  nameAr: string;
  fee: number;
}
