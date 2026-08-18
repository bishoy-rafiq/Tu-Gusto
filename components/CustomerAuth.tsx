"use client";

import { useState, useEffect, useCallback } from "react";

type Customer = {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  notifyProducts: boolean;
  notifyOffers: boolean;
};

export default function CustomerAuth({ locale, onLogin }: { locale: string; onLogin?: (c: Customer) => void }) {
  const isAr = locale === "ar";
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "" });
  const [notifyProducts, setNotifyProducts] = useState(true);
  const [notifyOffers, setNotifyOffers] = useState(true);

  useEffect(() => {
    fetch("/api/customer/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.customer) {
          setCustomer(d.customer);
          setForm({ name: d.customer.name, phone: d.customer.phone, address: d.customer.address, city: d.customer.city });
          setNotifyProducts(d.customer.notifyProducts);
          setNotifyOffers(d.customer.notifyOffers);
          onLogin?.(d.customer);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const requestOtp = useCallback(async () => {
    if (!email.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setError(isAr ? "خطأ في الإرسال" : "Failed to send code");
        return;
      }
      setStep("code");
    } catch {
      setError(isAr ? "خطأ في الاتصال" : "Network error");
    } finally {
      setSending(false);
    }
  }, [email, isAr]);

  const verifyCode = useCallback(async () => {
    if (!code.trim()) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/customer/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        setError(isAr ? "الكود غير صحيح" : "Invalid code");
        return;
      }
      const data = await res.json();
      setCustomer(data.customer);
      setForm({ name: data.customer.name, phone: data.customer.phone, address: data.customer.address, city: data.customer.city });
      onLogin?.(data.customer);
      setStep("email");
      setEmail("");
      setCode("");
    } catch {
      setError(isAr ? "خطأ" : "Error");
    } finally {
      setVerifying(false);
    }
  }, [email, code, isAr, onLogin]);

  async function saveProfile() {
    setSending(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, notifyProducts, notifyOffers }),
      });
      const data = await res.json();
      if (data.customer) {
        setCustomer(data.customer);
        setEditing(false);
      }
    } catch {} finally {
      setSending(false);
    }
  }

  async function logout() {
    await fetch("/api/customer/profile", { method: "DELETE" });
    setCustomer(null);
    setForm({ name: "", phone: "", address: "", city: "" });
  }

  if (loading) {
    return <div className="w-full h-20 rounded-xl bg-surface animate-pulse" />;
  }

  if (customer) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-brand-brown font-semibold text-sm">{customer.name || customer.email}</p>
            <p className="text-muted text-xs">{customer.email}</p>
          </div>
          <button onClick={logout} className="text-xs text-muted hover:text-red-400 transition-colors">
            {isAr ? "تسجيل خروج" : "Logout"}
          </button>
        </div>

        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-ghost w-full text-sm">
            {isAr ? "تعديل الملف الشخصي" : "Edit Profile"}
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-brand-brown mb-1">{isAr ? "الاسم" : "Name"}</label>
              <input className="input-modern text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-brown mb-1">{isAr ? "الهاتف" : "Phone"}</label>
              <input className="input-modern text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-brown mb-1">{isAr ? "العنوان" : "Address"}</label>
              <input className="input-modern text-sm" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-brand-brown mb-1">{isAr ? "المدينة" : "City"}</label>
              <input className="input-modern text-sm" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input type="checkbox" checked={notifyProducts} onChange={(e) => setNotifyProducts(e.target.checked)} className="rounded" />
                {isAr ? "إشعار عند إضافة منتجات جديدة" : "Notify on new products"}
              </label>
              <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                <input type="checkbox" checked={notifyOffers} onChange={(e) => setNotifyOffers(e.target.checked)} className="rounded" />
                {isAr ? "إشعار عند وجود عروض" : "Notify on new offers"}
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={saveProfile} disabled={sending} className="btn-accent flex-1 text-sm">
                {sending ? "..." : isAr ? "حفظ" : "Save"}
              </button>
              <button onClick={() => setEditing(false)} className="btn-ghost text-sm">
                {isAr ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-brand-brown font-semibold text-sm">
        {isAr ? "تسجيل الدخول لحفظ بياناتك" : "Sign in to save your info"}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3 text-xs text-red-300">{error}</div>
      )}

      {step === "email" ? (
        <>
          <div>
            <label className="block text-xs font-medium text-brand-brown mb-1">{isAr ? "البريد الإلكتروني" : "Email"}</label>
            <input
              type="email"
              required
              className="input-modern text-sm"
              placeholder={isAr ? "example@email.com" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && requestOtp()}
            />
          </div>
          <button onClick={requestOtp} disabled={sending || !email.trim()} className="btn-accent w-full text-sm disabled:opacity-50">
            {sending ? "..." : isAr ? "إرسال كود التحقق" : "Send verification code"}
          </button>
        </>
      ) : (
        <>
          <p className="text-muted text-xs">{isAr ? `تم إرسال كود إلى ${email}` : `Code sent to ${email}`}</p>
          <div>
            <label className="block text-xs font-medium text-brand-brown mb-1">{isAr ? "كود التحقق" : "Verification code"}</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="input-modern text-sm tracking-[0.3em] text-center"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && verifyCode()}
              autoFocus
            />
          </div>
          <button onClick={verifyCode} disabled={verifying || code.length < 6} className="btn-accent w-full text-sm disabled:opacity-50">
            {verifying ? "..." : isAr ? "تحقق" : "Verify"}
          </button>
          <button onClick={() => { setStep("email"); setCode(""); setError(""); }} className="w-full text-center text-xs text-muted hover:text-brand-brown transition-colors">
            {isAr ? "تغيير البريد" : "Change email"}
          </button>
        </>
      )}
    </div>
  );
}
