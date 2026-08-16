import type { SettingsRepository } from "@/domain/repositories";

export type SettingsUseCases = {
  get(): Promise<{ adminEmail: string | null }>;
  updateAdminEmail(email: string): Promise<{ adminEmail: string }>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function createSettingsUseCases(deps: {
  settings: SettingsRepository;
}): SettingsUseCases {
  return {
    async get() {
      return { adminEmail: await deps.settings.getAdminEmail() };
    },

    async updateAdminEmail(email) {
      const clean = String(email ?? "").trim();
      if (clean && !EMAIL_RE.test(clean)) {
        throw new Error("Please enter a valid email address");
      }
      await deps.settings.setAdminEmail(clean || null);
      return { adminEmail: clean };
    },
  };
}
