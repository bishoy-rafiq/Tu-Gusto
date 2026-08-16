import "server-only";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env"
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  // supabase-js needs a WebSocket for its (unused) realtime client;
  // Node 20 has no native WebSocket, so provide the `ws` transport.
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});
