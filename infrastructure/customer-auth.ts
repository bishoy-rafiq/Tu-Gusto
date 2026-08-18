import { signSessionToken, verifySessionToken, getSessionEmail } from "./auth";

const CUSTOMER_SESSION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function signCustomerToken(email: string): Promise<string> {
  return signSessionToken(email, CUSTOMER_SESSION_TTL);
}

export async function verifyCustomerToken(token: string | undefined): Promise<boolean> {
  return verifySessionToken(token);
}

export async function getCustomerEmailFromToken(token: string | undefined): Promise<string | null> {
  return getSessionEmail(token);
}
