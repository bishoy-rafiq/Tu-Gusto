import type { BostaService } from "@/domain/services";
import { createNotificationPort } from "@/application/notifications";
import { createOrderUseCases } from "@/application/orders";
import { createProductUseCases } from "@/application/products";
import { createPushUseCases } from "@/application/push";
import { createReviewUseCases } from "@/application/reviews";
import { createSettingsUseCases } from "@/application/settings";
import { createStatsUseCases } from "@/application/stats";
import { createWheelUseCases } from "@/application/wheel";
import { supabaseOrderRepository } from "./persistence/order.repository";
import { supabaseProductRepository } from "./persistence/product.repository";
import { supabasePushSubscriptionRepository } from "./persistence/push-subscription.repository";
import { supabaseReviewRepository } from "./persistence/review.repository";
import { supabaseSettingsRepository } from "./persistence/settings.repository";
import { supabaseWheelRepository } from "./persistence/wheel.repository";
import {
  BOSTA_ENABLED,
  cancelBostaDelivery,
  createBostaDelivery,
} from "./bosta";
import {
  adminNewOrderEmail,
  adminTestEmail,
  clientOrderCancelledEmail,
  clientOrderConfirmationEmail,
  clientOrderEmail,
} from "./notifications/smtp";
import {
  pushNewOrderNotification,
  sendPushToAdmin,
} from "./notifications/push";
import {
  adminNewOrderWhatsApp,
  clientStatusWhatsApp,
} from "./notifications/whatsapp";

export const repositories = {
  products: supabaseProductRepository,
  orders: supabaseOrderRepository,
  reviews: supabaseReviewRepository,
  wheel: supabaseWheelRepository,
  pushSubscriptions: supabasePushSubscriptionRepository,
  settings: supabaseSettingsRepository,
};

export const bostaService: BostaService = {
  enabled: BOSTA_ENABLED,
  create: createBostaDelivery,
  cancel: cancelBostaDelivery,
};

export const notificationPort = createNotificationPort({
  whatsapp: { adminNewOrderWhatsApp, clientStatusWhatsApp },
  email: {
    adminNewOrderEmail,
    adminTestEmail,
    clientOrderConfirmationEmail,
    clientOrderEmail,
    clientOrderCancelledEmail,
  },
  push: { pushNewOrderNotification, sendPushToAdmin },
});

export const productsApp = createProductUseCases(repositories);
export const ordersApp = createOrderUseCases({
  orders: repositories.orders,
  products: repositories.products,
  wheel: repositories.wheel,
  notifications: notificationPort,
  bosta: bostaService,
});
export const reviewsApp = createReviewUseCases(repositories);
export const wheelApp = createWheelUseCases(repositories);
export const pushApp = createPushUseCases(repositories);
export const statsApp = createStatsUseCases(repositories);
export const settingsApp = createSettingsUseCases(repositories);
