import type { MetadataRoute } from "next";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/infrastructure/auth";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const cookieStore = await cookies();
  const isAdmin = await verifySessionToken(cookieStore.get("admin_session")?.value);

  return {
    name: "Tu Gusto — على مزاجك",
    short_name: "Tu Gusto",
    description: "Premium espresso machines, grinders, and beans.",
    start_url: isAdmin ? "/admin" : "/",
    display: "standalone",
    background_color: "#141009",
    theme_color: "#141009",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
