declare module "web-push" {
  interface PushSubscription {
    endpoint: string;
    expirationTime?: number | null;
    keys: { p256dh: string; auth: string };
  }

  interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  export function setVapidDetails(
    email: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function generateVAPIDKeys(): {
    publicKey: string;
    privateKey: string;
  };

  export function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer,
    options?: {
      TTL?: number;
      urgency?: string;
      topic?: string;
      proxy?: string;
      headers?: Record<string, string>;
    }
  ): Promise<SendResult>;
}
