import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/application/auth";
import { supabase } from "@/infrastructure/persistence/supabase";

const BUCKET = "product-images";
const FOLDER = "products";

const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Extension is derived from the declared MIME type, never from the
    // client-supplied filename (blocks HTML/SVG polyglot uploads).
    const ext = mimeToExt[file.type];
    if (!ext) {
      return NextResponse.json({ error: "Only JPG, PNG and WebP allowed" }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storagePath = `${FOLDER}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) {
      console.error("storage upload error:", error.message);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return NextResponse.json({ url: data.publicUrl });
  } catch (e) {
    console.error("upload route error:", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
