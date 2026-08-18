import type { Customer, CustomerNotification, CustomerOtp } from "./customer-entities";

export interface CustomerRepository {
  getByEmail(email: string): Promise<Customer | null>;
  getById(id: string): Promise<Customer | null>;
  create(data: { email: string; name?: string; phone?: string; address?: string; city?: string }): Promise<Customer>;
  update(id: string, patch: Partial<Pick<Customer, "name" | "phone" | "address" | "city" | "notifyProducts" | "notifyOffers">>): Promise<Customer | null>;
  listAll(): Promise<Customer[]>;
}

export interface CustomerOtpRepository {
  save(email: string, code: string, expiresAt: Date): Promise<void>;
  getValid(email: string, code: string): Promise<CustomerOtp | null>;
  markUsed(id: string): Promise<void>;
  cleanup(): Promise<void>;
}

export interface CustomerNotificationRepository {
  save(customerId: string, sub: { endpoint: string; p256dh: string; auth: string }): Promise<void>;
  removeByEndpoint(endpoint: string): Promise<void>;
  removeByCustomerId(customerId: string): Promise<void>;
  listAll(): Promise<(CustomerNotification & { customer?: Customer })[]>;
  listByCustomerId(customerId: string): Promise<CustomerNotification[]>;
}
