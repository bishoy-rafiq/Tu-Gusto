// Migrate product images from local /uploads to Supabase Storage.
//
// Usage:
//   node scripts/migrate-images.mjs
//
// Requires the "product-images" bucket + policies from supabase-schema.sql to
// already exist in the project (run that SQL in the Supabase dashboard first).

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import WebSocket from "ws";

function env(key) {
  const line = readFileSync(".env", "utf8").split("\n").find((l) => l.startsWith(key + "="));
  if (!line) return null;
  return line.slice(key.length + 1).replace(/^"|"$/g, "").trim();
}

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const key = env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const BUCKET = "product-images";
const FOLDER = "products";
const supabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: { transport: WebSocket },
});

function isLocal(u) {
  return typeof u === "string" && u.startsWith("/uploads/");
}

async function uploadLocal(localUrl) {
  const rel = localUrl.replace(/^\/+/, "");
  const filePath = join(process.cwd(), "public", rel);
  if (!existsSync(filePath)) {
    console.log("  ! missing file, skipping:", localUrl);
    return null;
  }
  const ext = filePath.split(".").pop()?.toLowerCase();
  const contentType = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml" }[ext] || "application/octet-stream";
  const storagePath = `${FOLDER}/${rel.replace(/[/\\]+/g, "-")}`;

  const { data: existing } = await supabase.storage.from(BUCKET).list(FOLDER, { search: storagePath.split("/").pop() });
  if (!existing?.length) {
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, readFileSync(filePath), {
      contentType,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.log("  ! upload error:", error.message);
      return null;
    }
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, imageUrl, images");
  if (error) {
    console.error("Failed to load products:", error.message);
    process.exit(1);
  }

  console.log(`Loaded ${products.length} products`);

  for (const p of products) {
    const updates = {};
    if (isLocal(p.imageUrl)) {
      const remote = await uploadLocal(p.imageUrl);
      if (remote) updates.imageUrl = remote;
    }
    const extras = (p.images || []).filter(isLocal);
    if (extras.length) {
      const remotes = [];
      let ok = true;
      for (const img of extras) {
        const remote = await uploadLocal(img);
        if (!remote) { ok = false; break; }
        remotes.push(remote);
      }
      if (ok) updates.images = [...(p.images || []).filter((i) => !isLocal(i)), ...remotes];
    }

    if (Object.keys(updates).length) {
      const { error: updErr } = await supabase.from("products").update(updates).eq("id", p.id);
      console.log(`${updErr ? "! FAILED" : "+ migrated"} ${p.name}:`, updErr ? updErr.message : JSON.stringify(updates));
    } else {
      console.log("= no local images:", p.name);
    }
  }

  console.log("Done.");
}

main();
