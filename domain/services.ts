export interface BostaOrderInput {
  id: string;
  customerName: string;
  customerEmail?: string | null;
  phone: string;
  address: string;
  city: string;
}

export interface BostaItemInput {
  name: string;
  quantity: number;
}

export interface BostaDeliveryResult {
  deliveryId: string | null;
  trackingNumber: string | null;
}

export interface BostaService {
  readonly enabled: boolean;
  create(order: BostaOrderInput, items: BostaItemInput[]): Promise<BostaDeliveryResult>;
  cancel(trackingNumber: string): Promise<boolean>;
}
