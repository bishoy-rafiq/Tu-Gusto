export const BOSTA_ENABLED = !!process.env.BOSTA_API_KEY;

const BOSTA_BASE = process.env.BOSTA_BASE_URL || "https://app.bosta.co/api/v2";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Our checkout city names -> Bosta city codes (from GET /api/v2/cities)
export const BOSTA_CITY_MAP: Record<string, string> = {
  Cairo: "EG-01",
  Giza: "EG-25",
  Alexandria: "EG-02",
  Qalyubia: "EG-06",
  Sharqia: "EG-10",
  Dakahlia: "EG-05",
  Gharbia: "EG-07",
  Monufia: "EG-09",
  Beheira: "EG-04",
  "Kafr El Sheikh": "EG-08",
  Damietta: "EG-14",
  "Port Said": "EG-13",
  Suez: "EG-12",
  Ismailia: "EG-11",
  "North Sinai": "EG-27",
  "South Sinai": "EG-26",
  "Beni Suef": "EG-16",
  Fayoum: "EG-15",
  Minya: "EG-19",
  Assiut: "EG-17",
  Sohag: "EG-18",
  Qena: "EG-20",
  Luxor: "EG-22",
  Aswan: "EG-21",
  "Red Sea": "EG-23",
  "New Valley": "EG-24",
  Matrouh: "EG-28",
};

export function bostaWebhookUrl() {
  return `${SITE_URL}/api/bosta/webhook`;
}

export type BostaOrder = {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  phone: string;
  address: string;
  city: string;
};

export type BostaItem = {
  name: string;
  quantity: number;
};

async function bostaFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BOSTA_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.BOSTA_API_KEY || "",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

export async function createBostaDelivery(order: BostaOrder, items: BostaItem[]) {
  const nameParts = order.customerName.trim().split(/\s+/);

  const payload: Record<string, unknown> = {
    type: 10,
    businessReference: order.id,
    webhookUrl: bostaWebhookUrl(),
    receiver: {
      firstName: nameParts[0] || "Customer",
      lastName: nameParts.slice(1).join(" ") || ".",
      phone: order.phone.replace(/[^0-9]/g, ""),
      email: order.customerEmail || undefined,
    },
    dropOffAddress: {
      city: BOSTA_CITY_MAP[order.city] || order.city,
      firstLine: order.address,
    },
    specs: {
      packageDetails: {
        itemsCount: items.reduce((sum, i) => sum + i.quantity, 0),
        description: items
          .map((i) => `${i.name} x${i.quantity}`)
          .join(", ")
          .slice(0, 200),
      },
    },
  };

  const { res, json } = await bostaFetch("/deliveries", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!res.ok || !json?.success) {
    throw new Error((json && json.message) || `Bosta error ${res.status}`);
  }

  return {
    deliveryId: json.data?._id || null,
    trackingNumber: json.data?.trackingNumber || null,
  };
}

export async function cancelBostaDelivery(trackingNumber: string) {
  // Look up the delivery by tracking number to get its Bosta id, then terminate it.
  const { res, json } = await bostaFetch(`/deliveries/${trackingNumber}`);
  if (!res.ok) return false;
  const deliveryId = json?.data?._id || json?._id;
  if (!deliveryId) return false;
  const { res: delRes } = await bostaFetch(`/deliveries/${deliveryId}`, {
    method: "DELETE",
  });
  return delRes.ok;
}
