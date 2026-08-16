import type { SettingsRepository } from "@/domain/repositories";
import { supabase } from "@/infrastructure/persistence/supabase";

const ADMIN_EMAIL_KEY = "admin_email";

export const supabaseSettingsRepository: SettingsRepository = {
  async getAdminEmail() {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", ADMIN_EMAIL_KEY)
      .maybeSingle();
    if (error) return null;
    return (data?.value as string | null) || null;
  },

  async setAdminEmail(email) {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: ADMIN_EMAIL_KEY, value: email }, { onConflict: "key" });
    if (error) throw new Error("Could not save settings");
  },
};
