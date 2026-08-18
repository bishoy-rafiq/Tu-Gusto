export interface Customer {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  notifyProducts: boolean;
  notifyOffers: boolean;
  createdAt?: string;
}

export interface CustomerOtp {
  id: string;
  email: string;
  code: string;
  expiresAt: string;
  used: boolean;
}

export interface CustomerNotification {
  id: string;
  customerId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}
