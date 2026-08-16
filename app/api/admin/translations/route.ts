import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { requireAdmin } from "@/application/auth";
import adminDefaults from "@/dictionaries/admin.json";
import enDefaults from "@/dictionaries/en.json";
import arDefaults from "@/dictionaries/ar.json";
import {
  flattenDict,
  setPath,
  type TranslationValue,
} from "@/lib/translations-core";

export const runtime = "nodejs";

const dictDir = path.join(process.cwd(), "dictionaries");
const adminFile = path.join(dictDir, "admin.json");
const enFile = path.join(dictDir, "en.json");
const arFile = path.join(dictDir, "ar.json");

const adminKeys = new Set(Object.keys(adminDefaults as Record<string, TranslationValue>));

function readJson(file: string, fallback: unknown): unknown {
  return fs
    .readFile(file, "utf8")
    .then((text) => JSON.parse(text))
    .catch(() => fallback);
}

function writeJson(file: string, data: unknown) {
  const tmp = `${file}.tmp`;
  return fs
    .writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8")
    .then(() => fs.rename(tmp, file));
}

export async function GET(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const [en, ar, admin] = await Promise.all([
    readJson(enFile, enDefaults),
    readJson(arFile, arDefaults),
    readJson(adminFile, adminDefaults),
  ]);

  const storefrontEn = flattenDict(en as Record<string, unknown>);
  const storefrontAr = flattenDict(ar as Record<string, unknown>);
  const entries: Record<string, TranslationValue> = {};
  for (const key of Object.keys(storefrontEn)) {
    entries[key] = {
      en: storefrontEn[key],
      ar: storefrontAr[key] ?? storefrontEn[key],
    };
  }
  Object.assign(entries, admin as Record<string, TranslationValue>);

  const defaults: Record<string, TranslationValue> = {};
  const defaultEn = flattenDict(enDefaults as Record<string, unknown>);
  const defaultAr = flattenDict(arDefaults as Record<string, unknown>);
  for (const key of Object.keys(defaultEn)) {
    defaults[key] = {
      en: defaultEn[key],
      ar: defaultAr[key] ?? defaultEn[key],
    };
  }
  Object.assign(defaults, adminDefaults as Record<string, TranslationValue>);

  return NextResponse.json({ entries, defaults });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  let body: { entries?: { key: string; en: string; ar: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    return NextResponse.json(
      { error: "entries must be a non-empty array" },
      { status: 400 }
    );
  }

  const [en, ar, admin] = await Promise.all([
    readJson(enFile, enDefaults),
    readJson(arFile, arDefaults),
    readJson(adminFile, adminDefaults),
  ]);

  let adminChanged = false;
  let storefrontChanged = false;
  let saved = 0;

  for (const item of body.entries) {
    const key = typeof item?.key === "string" ? item.key.trim() : "";
    if (!key || !key.includes(".")) continue;
    const enValue = typeof item.en === "string" ? item.en : "";
    const arValue = typeof item.ar === "string" ? item.ar : "";
    if (adminKeys.has(key)) {
      (admin as Record<string, TranslationValue>)[key] = { en: enValue, ar: arValue };
      adminChanged = true;
    } else {
      setPath(en as Record<string, unknown>, key, enValue);
      setPath(ar as Record<string, unknown>, key, arValue);
      storefrontChanged = true;
    }
    saved++;
  }

  try {
    if (adminChanged) await writeJson(adminFile, admin);
    if (storefrontChanged) {
      await Promise.all([writeJson(enFile, en), writeJson(arFile, ar)]);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save translations";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ saved });
}
