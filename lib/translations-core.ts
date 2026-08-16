// Pure helpers for the admin Translations editor (reads/writes the local JSON
// dictionary files through the admin API). No I/O, no server-only imports.

export type Locale = "en" | "ar";

export type TranslationValue = { en: string; ar: string };

export function flattenDict(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") {
      Object.assign(out, flattenDict(value as Record<string, unknown>, fullKey));
    } else {
      out[fullKey] = String(value ?? "");
    }
  }
  return out;
}

// Sets a dotted key (e.g. "hero.tagline") onto a nested object without
// disturbing arrays or sibling values.
export function setPath(
  obj: Record<string, unknown>,
  path: string,
  value: string
) {
  const parts = path.split(".");
  let node: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (typeof node[part] !== "object" || node[part] === null) {
      node[part] = {};
    }
    node = node[part] as Record<string, unknown>;
  }
  node[parts[parts.length - 1]] = value;
}
