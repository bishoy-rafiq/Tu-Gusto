import type { CustomerRepository, CustomerOtpRepository, CustomerNotificationRepository } from "@/domain/customer-repositories";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface CustomerUseCases {
  requestOtp(email: string): Promise<{ sent: boolean; devOtp?: string }>;
  verifyOtp(email: string, code: string): Promise<{ token: string; customer: { id: string; email: string; name: string; phone: string; address: string; city: string; notifyProducts: boolean; notifyOffers: boolean } } | null>;
  getProfile(email: string): Promise<any>;
  updateProfile(email: string, patch: { name?: string; phone?: string; address?: string; city?: string; notifyProducts?: boolean; notifyOffers?: boolean }): Promise<any>;
  savePushSubscription(customerId: string, sub: { endpoint: string; p256dh: string; auth: string }): Promise<void>;
  removePushSubscription(endpoint: string): Promise<void>;
  getAllSubscribedCustomers(): Promise<any[]>;
}

export function createCustomerUseCases(deps: {
  customers: CustomerRepository;
  otps: CustomerOtpRepository;
  notifications: CustomerNotificationRepository;
  sendOtpEmail(email: string, code: string): Promise<void>;
  signToken(email: string): Promise<string>;
}): CustomerUseCases {
  const { customers, otps, notifications, sendOtpEmail, signToken } = deps;

  return {
    async requestOtp(email) {
      const normalized = email.toLowerCase().trim();
      if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
        throw new Error("Invalid email");
      }

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await otps.save(normalized, code, expiresAt);

      let devOtp: string | undefined;
      if (process.env.NODE_ENV !== "production") {
        devOtp = code;
      }

      try {
        await sendOtpEmail(normalized, code);
      } catch {}

      return { sent: true, devOtp };
    },

    async verifyOtp(email, code) {
      const normalized = email.toLowerCase().trim();
      const otp = await otps.getValid(normalized, code);
      if (!otp) return null;

      await otps.markUsed(otp.id);

      let customer = await customers.getByEmail(normalized);
      if (!customer) {
        customer = await customers.create({ email: normalized });
      }

      const token = await signToken(normalized);

      return {
        token,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          notifyProducts: customer.notifyProducts,
          notifyOffers: customer.notifyOffers,
        },
      };
    },

    async getProfile(email) {
      const customer = await customers.getByEmail(email.toLowerCase().trim());
      return customer;
    },

    async updateProfile(email, patch) {
      const customer = await customers.getByEmail(email.toLowerCase().trim());
      if (!customer) throw new Error("Customer not found");
      const updated = await customers.update(customer.id, patch);
      return updated;
    },

    async savePushSubscription(customerId, sub) {
      await notifications.save(customerId, sub);
    },

    async removePushSubscription(endpoint) {
      await notifications.removeByEndpoint(endpoint);
    },

    async getAllSubscribedCustomers() {
      return customers.listAll();
    },
  };
}
