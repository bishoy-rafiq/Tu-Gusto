"use client";

import { useEffect, useState } from "react";
import AdminModal from "@/components/AdminModal";
import { useToast } from "@/components/ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";
import { radialTextRotation, fitRadialFont } from "@/lib/wheel-utils";

type Prize = {
  id: string;
  label: string;
  labelAr: string;
  code: string;
  color: string;
  weight: number;
  active: boolean;
};
const defaultColors = ["#1B140E", "#3A2D22", "#5C4026", "#7A4622", "#93552B", "#AD6532", "#C6783F", "#4E3422", "#A03028"];

const emptyForm = { label: "", labelAr: "", code: "", color: "#3A2D22", weight: "1" };

export default function AdminWheelPage() {
  const { toast } = useToast();
  const { t } = useAdminI18n();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Prize | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadPrizes() {
    const res = await fetch("/api/admin/wheel");
    setPrizes(await res.json());
  }

  useEffect(() => {
    loadPrizes();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, weight: parseInt(form.weight) || 1 };

    const res = editingId
      ? await fetch(`/api/admin/wheel/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/wheel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setLoading(false);
    if (res.ok) {
      toast("success", editingId ? t("wh.updated") : t("wh.added"), form.label);
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      loadPrizes();
    } else {
      toast("error", t("wh.couldnSave"), t("common.somethingWrong"));
    }
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function startEdit(p: Prize) {
    setEditingId(p.id);
    setForm({ label: p.label, labelAr: p.labelAr, code: p.code, color: p.color, weight: p.weight.toString() });
    setFormOpen(true);
  }

  function cancelEdit() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const label = deleteTarget.label;
    await fetch(`/api/admin/wheel/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    toast("success", t("wh.deleted"), label);
    loadPrizes();
  }

  async function toggleActive(id: string, active: boolean) {
    const p = prizes.find((x) => x.id === id);
    await fetch(`/api/admin/wheel/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, active: !active }),
    });
    toast("info", p?.active ? t("wh.deactivated") : t("wh.activated"), p?.label);
    loadPrizes();
  }

  const inputClass = "w-full border border-white/[0.1] rounded-lg px-4 py-2.5 bg-surface text-brand-tan placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-rust/40 transition";

  // Preview wheel
  const activePrizes = prizes.filter((p) => p.active);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl text-brand-tan">{t("wh.title")}</h1>
          <p className="text-sm text-brand-tan/50 mt-0.5">{t("wh.count").replace("{n}", prizes.length.toString()).replace("{m}", activePrizes.length.toString())}</p>
        </div>
        <button onClick={openAdd} className="btn-gold !px-5 !py-2.5 !rounded-xl !text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("wh.add")}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Prize list */}
        <div>
          <div className="space-y-3">
            {prizes.map((p) => (
              <div key={p.id} className={`flex flex-wrap items-center gap-x-4 gap-y-3 bg-card border border-white/[0.08] rounded-xl p-4 transition-all hover:border-brand-rust/20 ${!p.active ? "opacity-50" : ""}`}>
                <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ backgroundColor: p.color }} />
                <div className="flex-1 min-w-[130px]">
                  <p className="font-medium text-brand-tan">{p.label}</p>
                  {p.labelAr && <p dir="rtl" className="text-sm text-brand-tan/50">{p.labelAr}</p>}
                  <p className="text-sm text-brand-tan/50 font-mono">{p.code} · {t("wh.weight").replace("{n}", p.weight.toString())}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
                  <button onClick={() => toggleActive(p.id, p.active)}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${p.active ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" : "bg-white/[0.08] text-muted hover:bg-white/[0.15]"}`}>
                    {p.active ? t("common.active") : t("common.inactive")}
                  </button>
                  <button onClick={() => startEdit(p)} className="text-brand-rust text-sm font-medium hover:underline">{t("common.edit")}</button>
                  <button onClick={() => setDeleteTarget(p)} className="text-red-400 text-sm font-medium hover:underline">{t("common.delete")}</button>
                </div>
              </div>
            ))}
          </div>

          {prizes.length === 0 && (
            <p className="text-brand-tan/50 text-center py-12">{t("wh.none")}</p>
          )}
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-10 self-start">
          <div className="bg-card border border-white/[0.08] rounded-2xl p-5 shadow-lg shadow-black/20 text-center">
            <h3 className="text-sm font-medium text-brand-tan/60 mb-3">{t("wh.preview")}</h3>
            {activePrizes.length > 0 ? (
              <svg width="260" height="260" viewBox="0 0 260 260" className="mx-auto w-full max-w-[260px] h-auto">
                <circle cx="130" cy="130" r="124" fill="#141009" />
                <circle cx="130" cy="130" r="120" fill="none" stroke="#C6A05C" strokeWidth="1.5" strokeDasharray="6 3" />
                {activePrizes.map((prize, i) => {
                  const n = activePrizes.length;
                  const sliceAngle = 360 / n;
                  const startAngle = (i * sliceAngle * Math.PI) / 180;
                  const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
                  const r = 120;
                  const x1 = 130 + r * Math.cos(startAngle - Math.PI / 2);
                  const y1 = 130 + r * Math.sin(startAngle - Math.PI / 2);
                  const x2 = 130 + r * Math.cos(endAngle - Math.PI / 2);
                  const y2 = 130 + r * Math.sin(endAngle - Math.PI / 2);
                  const largeArc = sliceAngle > 180 ? 1 : 0;
                  const path = `M 130 130 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                  const midAngle = i * sliceAngle + sliceAngle / 2;
                  const textR = r * 0.6;
                  const midRad = (midAngle * Math.PI) / 180;
                  const tx = 130 + textR * Math.cos(midRad - Math.PI / 2);
                  const ty = 130 + textR * Math.sin(midRad - Math.PI / 2);
                  const textRotation = radialTextRotation(midAngle);
                  const fontSize = fitRadialFont(prize.label, textR, r, 22, 11, 7);
                  return (
                    <g key={prize.id}>
                      <path d={path} fill={prize.color} />
                      <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={fontSize} fontWeight="700" transform={`rotate(${textRotation}, ${tx}, ${ty})`}>
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
                <circle cx="130" cy="130" r="18" fill="#141009" stroke="#C6A05C" strokeWidth="1.5" />
                <circle cx="130" cy="130" r="6" fill="#C6A05C" />
              </svg>
            ) : (
              <div className="w-full max-w-[260px] h-[260px] rounded-full bg-surface mx-auto flex items-center justify-center text-muted text-sm">
                {t("wh.noPreview")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit modal */}
      <AdminModal
        open={formOpen}
        onClose={cancelEdit}
        title={editingId ? t("wh.editTitle") : t("wh.addTitle")}
        subtitle={editingId ? t("wh.editSubtitle") : t("wh.addSubtitle")}
      >
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-brand-tan/50 mb-1 block">{t("wh.label")}</label>
            <input required placeholder={t("wh.labelPlaceholder")} className={inputClass}
              value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-brand-tan/50 mb-1 block">{t("wh.labelAr")}</label>
            <input dir="rtl" placeholder={t("wh.labelPlaceholder")} className={inputClass}
              value={form.labelAr} onChange={(e) => setForm({ ...form, labelAr: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-brand-tan/50 mb-1 block">{t("wh.code")}</label>
            <input required placeholder={t("wh.codePlaceholder")} className={inputClass}
              value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="text-xs text-brand-tan/50 mb-1 block">{t("wh.color")}</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="w-10 h-10 rounded-lg border border-white/[0.15] cursor-pointer bg-surface" />
              <div className="flex gap-1.5 flex-wrap">
                {defaultColors.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${form.color === c ? "border-brand-rust scale-110" : "border-white/20 hover:scale-105"}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs text-brand-tan/50 mb-1 block">{t("wh.weightLabel")}</label>
            <input type="number" min="1" max="100" className={inputClass}
              value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>

          <div className="sm:col-span-2 flex gap-3 pt-1">
            <button type="submit" disabled={loading}
              className="btn-gold !px-6 !py-2.5 !rounded-xl !text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? t("common.saving") : editingId ? t("wh.update") : t("wh.add")}
            </button>
            <button type="button" onClick={cancelEdit} className="glass-chip text-brand-tan px-5 py-2.5 rounded-xl text-sm font-medium hover:border-brand-rust/40 transition-all">
              {t("common.cancel")}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete confirm modal */}
      <AdminModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t("wh.deleteTitle")}
        subtitle={deleteTarget ? t("wh.deleteSubtitle").replace("{label}", deleteTarget.label) : ""}
        size="sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            {t("wh.confirmDelete")}
          </p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setDeleteTarget(null)} className="glass-chip text-brand-tan px-5 py-2.5 rounded-xl text-sm font-medium hover:border-brand-rust/40 transition-all">
            {t("common.cancel")}
          </button>
          <button onClick={confirmDelete} className="inline-flex items-center gap-2 bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-400 transition-all hover:shadow-lg hover:shadow-red-500/20">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            {t("common.delete")}
          </button>
        </div>
      </AdminModal>
    </div>
  );
}
