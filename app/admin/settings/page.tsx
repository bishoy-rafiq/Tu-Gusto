"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { t } = useAdminI18n();
  const [adminEmail, setAdminEmail] = useState("");
  const [testing, setTesting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => setAdminEmail(d.email ?? ""))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast("error", t("st.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("error", t("st.passwordsDontMatch"));
      return;
    }
    setChanging(true);
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setChanging(false);

    if (res.ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast("success", t("st.passwordChanged"), t("st.passwordChangedMsg"));
    } else {
      const data = await res.json().catch(() => ({}));
      toast("error", t("st.couldnSave"), data.error || t("common.somethingWrong"));
    }
  }

  async function handleTest() {
    setTesting(true);
    const res = await fetch("/api/admin/test-notification", { method: "POST" });
    const results = await res.json().catch(() => ({}));
    setTesting(false);
    if (results.email) {
      toast("success", t("st.testSent"), t("st.checkInbox").replace("{email}", adminEmail || t("st.emailPlaceholder")));
    } else {
      toast("error", t("st.testFailed"), results.emailDetail || t("st.noSmtp"));
    }
  }

  const inputClass = "w-full border border-white/[0.1] rounded-lg px-4 py-2.5 bg-surface text-brand-tan placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-rust/40 transition";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-brand-tan">{t("st.title")}</h1>
        <p className="text-sm text-brand-tan/50 mt-0.5">{t("st.subtitle")}</p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Account */}
        <div className="bg-card border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-sm font-medium text-brand-tan/60 mb-4">{t("st.account")}</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-brand-rust font-display font-semibold">
              {(adminEmail || "A").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-brand-tan font-medium text-sm break-all">{adminEmail || "—"}</p>
              <p className="text-xs text-brand-tan/50 mt-0.5">{t("st.signInEmail")}</p>
            </div>
          </div>
        </div>

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="bg-card border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-sm font-medium text-brand-tan/60 mb-1">{t("st.changePassword")}</h2>
          <p className="text-sm text-brand-tan/50 mb-4 leading-relaxed">{t("st.changePasswordDesc")}</p>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("st.currentPassword")}</label>
              <input
                type="password"
                required
                className={inputClass}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("st.newPassword")}</label>
              <input
                type="password"
                required
                minLength={8}
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("st.confirmPassword")}</label>
              <input
                type="password"
                required
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={changing || !loaded}
            className="btn-gold !px-6 !py-2.5 !rounded-xl !text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-5"
          >
            {changing ? t("st.updating") : t("st.updatePassword")}
          </button>
        </form>

        {/* Test notification */}
        <div className="bg-card border border-white/[0.08] rounded-2xl p-6">
          <h2 className="text-sm font-medium text-brand-tan/60 mb-1">{t("st.testTitle")}</h2>
          <p className="text-sm text-brand-tan/50 mb-4 leading-relaxed">
            {t("st.testDesc")}
          </p>
          <button
            onClick={handleTest}
            disabled={testing}
            className="glass-chip text-brand-tan px-5 py-2.5 rounded-xl text-sm font-medium hover:border-brand-rust/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? t("st.sending") : t("st.sendTest")}
          </button>
        </div>
      </div>
    </div>
  );
}
