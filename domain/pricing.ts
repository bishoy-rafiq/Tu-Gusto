import type { CityDelivery } from "./entities";

// Delivery pricing rules live in the domain: the fee per city and the
// default fee for anything not explicitly listed.
export const CITIES: CityDelivery[] = [
  { name: "Cairo", nameAr: "القاهرة", fee: 90 },
  { name: "Giza", nameAr: "الجيزة", fee: 90 },
  { name: "Alexandria", nameAr: "الإسكندرية", fee: 100 },
  { name: "Qalyubia", nameAr: "القليوبية", fee: 95 },
  { name: "Sharqia", nameAr: "الشرقية", fee: 110 },
  { name: "Dakahlia", nameAr: "الدقهلية", fee: 100 },
  { name: "Gharbia", nameAr: "الغربية", fee: 100 },
  { name: "Monufia", nameAr: "المنوفية", fee: 100 },
  { name: "Beheira", nameAr: "البحيرة", fee: 110 },
  { name: "Kafr El Sheikh", nameAr: "كفر الشيخ", fee: 110 },
  { name: "Damietta", nameAr: "دمياط", fee: 110 },
  { name: "Port Said", nameAr: "بورسعيد", fee: 100 },
  { name: "Suez", nameAr: "السويس", fee: 100 },
  { name: "Ismailia", nameAr: "الإسماعيلية", fee: 100 },
  { name: "North Sinai", nameAr: "شمال سيناء", fee: 140 },
  { name: "South Sinai", nameAr: "جنوب سيناء", fee: 150 },
  { name: "Beni Suef", nameAr: "بني سويف", fee: 120 },
  { name: "Fayoum", nameAr: "الفيوم", fee: 120 },
  { name: "Minya", nameAr: "المنيا", fee: 130 },
  { name: "Assiut", nameAr: "أسيوط", fee: 130 },
  { name: "Sohag", nameAr: "سوهاج", fee: 140 },
  { name: "Qena", nameAr: "قنا", fee: 140 },
  { name: "Luxor", nameAr: "الأقصر", fee: 150 },
  { name: "Aswan", nameAr: "أسوان", fee: 160 },
  { name: "Red Sea", nameAr: "البحر الأحمر", fee: 150 },
  { name: "New Valley", nameAr: "الوادي الجديد", fee: 180 },
  { name: "Matrouh", nameAr: "مطروح", fee: 170 },
];

export const DEFAULT_DELIVERY_FEE = 90;

export function getDeliveryFee(cityName: string): number {
  const city = CITIES.find((c) => c.name === cityName);
  return city ? city.fee : DEFAULT_DELIVERY_FEE;
}

export function isValidCity(cityName: string): boolean {
  return CITIES.some((c) => c.name === cityName);
}

export interface OrderTotals {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export function computeOrderTotals(input: {
  subtotal: number;
  deliveryFee: number;
  requestedDiscount?: string | number | null;
}): OrderTotals {
  const requestedDiscount = Number.isFinite(Number(input.requestedDiscount))
    ? Number(input.requestedDiscount)
    : 0;
  const discount = Math.max(
    0,
    Math.min(input.subtotal, Math.max(0, requestedDiscount))
  );
  return {
    subtotal: input.subtotal,
    deliveryFee: input.deliveryFee,
    discount,
    total: input.subtotal + input.deliveryFee - discount,
  };
}

// Extracts the percentage from a wheel prize label like "10% OFF".
// Returns null when the label carries no percentage (e.g. "Free Delivery").
export function percentFromLabel(
  label: string | null | undefined
): number | null {
  if (!label) return null;
  const match = String(label).match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
}
