// Loads the right dictionary for a locale entirely from bundled JSON —
// no database involved, so storefront pages stay fully static and fast.
// Edits made in the admin Translations page are saved to the JSON files and
// take effect on the storefront after the next `npm run build`.

import "server-only";
import { cache } from "react";
import en from "@/dictionaries/en.json";
import ar from "@/dictionaries/ar.json";

export type Locale = "en" | "ar";

export const getDictionary = cache(function getDictionary(locale: string) {
  return locale === "ar" ? ar : en;
});
