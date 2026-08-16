"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import AdminModal from "@/components/AdminModal";
import { useToast } from "@/components/ToastContext";
import { useAdminI18n } from "@/app/admin/i18n";

type Product = {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  price: string;
  originalPrice: string | null;
  category: string;
  imageUrl: string;
  images: string[];
  stock: number;
};

const emptyForm = { name: "", nameAr: "", slug: "", description: "", descriptionAr: "", price: "", originalPrice: "", category: "machines", imageUrl: "", images: [] as string[], stock: "0" };

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const { t } = useAdminI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    setProducts(await res.json());
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  }

  function openAdd() {
    setForm(emptyForm);
    setSlugTouched(false);
    setEditingId(null);
    setFormOpen(true);
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setSlugTouched(true);
    setForm({
      name: p.name,
      nameAr: p.nameAr,
      slug: p.slug,
      description: p.description,
      descriptionAr: p.descriptionAr,
      price: p.price.toString(),
      originalPrice: p.originalPrice?.toString() || "",
      category: p.category,
      imageUrl: p.imageUrl,
      images: p.images || [],
      stock: p.stock.toString(),
    });
    setFormOpen(true);
  }

  function cancelEdit() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setSlugTouched(false);
  }

  async function uploadFile(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);

    if (!res.ok) {
      toast("error", t("pr.uploadFailed"), t("pr.uploadFailedMsg"));
      return null;
    }

    const data = await res.json();
    return data.url as string;
  }

  async function handleFileSelect(file: File) {
    const url = await uploadFile(file);
    if (url) setForm((f) => ({ ...f, imageUrl: url }));
  }

  async function handleExtraFileSelect(file: File) {
    const url = await uploadFile(file);
    if (url) setForm((f) => ({ ...f, images: [...f.images, url] }));
  }

  function removeExtraImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, price: parseFloat(form.price), originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null, stock: parseInt(form.stock), images: form.images };

    const res = editingId
      ? await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    setLoading(false);
    if (res.ok) {
      toast("success", editingId ? t("pr.updated") : t("pr.added"), form.name);
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setSlugTouched(false);
      loadProducts();
    } else {
      toast("error", t("pr.couldnSave"), t("pr.checkSlug"));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    toast("success", t("pr.deleted"), name);
    loadProducts();
  }

  const inputClass = "w-full border border-white/[0.1] rounded-lg px-4 py-2.5 bg-surface text-brand-tan placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-rust/40 transition";

  const categoryLabel = (c: string) => {
    const map: Record<string, string> = {
      machines: "pr.catMachines",
      grinders: "pr.catGrinders",
      beans: "pr.catBeans",
      coffee: "pr.catCoffee",
      accessories: "pr.catAccessories",
    };
    return t(map[c] || "pr.catAccessories");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-brand-tan">{t("pr.title")}</h1>
          <p className="text-sm text-brand-tan/50 mt-0.5">{t("pr.total").replace("{n}", products.length.toString())}</p>
        </div>
        <button onClick={openAdd} className="btn-gold !px-5 !py-2.5 !rounded-xl !text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t("pr.add")}
        </button>
      </div>

      {/* Product list */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => (
          <div key={p.id} className="bg-card border border-white/[0.08] rounded-xl overflow-hidden group transition-all hover:border-brand-rust/25 hover:shadow-lg hover:shadow-black/20">
            <div className="aspect-video bg-brand-tan/10 relative">
              <Image src={p.imageUrl} alt={p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" unoptimized />
            </div>
            <div className="p-4">
              <p className="font-medium text-brand-tan">{p.name}</p>
              <p className="text-sm text-brand-tan/50 mb-3">{p.price} EGP · {categoryLabel(p.category)} · {t("common.stock")}: {p.stock}</p>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg bg-surface text-brand-tan hover:bg-surface-hover hover:border-brand-rust/30 border border-white/[0.08] transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  {t("common.edit")}
                </button>
                <button onClick={() => setDeleteTarget(p)} className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 transition-all">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {t("common.delete")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-brand-tan/50 text-center py-16">{t("pr.none")}</p>
      )}

      {/* Add / Edit modal */}
      <AdminModal
        open={formOpen}
        onClose={cancelEdit}
        title={editingId ? t("pr.editTitle") : t("pr.addTitle")}
        subtitle={editingId ? t("pr.editSubtitle") : t("pr.addSubtitle")}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid md:grid-cols-[1fr_260px] gap-8">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.name")}</label>
              <input required placeholder={t("pr.namePlaceholder")} className={inputClass}
                value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.nameAr")}</label>
              <input dir="rtl" placeholder={t("pr.namePlaceholder")} className={inputClass}
                value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.slug")}</label>
              <input required placeholder={t("pr.slugPlaceholder")} className={inputClass}
                value={form.slug} onChange={(e) => { setSlugTouched(true); setForm({ ...form, slug: e.target.value }); }} />
            </div>

            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.category")}</label>
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="machines">{t("pr.catMachines")}</option>
                <option value="grinders">{t("pr.catGrinders")}</option>
                <option value="beans">{t("pr.catBeans")}</option>
                <option value="coffee">{t("pr.catCoffee")}</option>
                <option value="accessories">{t("pr.catAccessories")}</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.price")}</label>
              <input required type="number" step="0.01" min="0" placeholder="0.00" className={inputClass}
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.originalPrice")}</label>
              <input type="number" step="0.01" min="0" placeholder={t("pr.originalPlaceholder")} className={inputClass}
                value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} />
            </div>

            <div>
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.stock")}</label>
              <input type="number" min="0" placeholder="0" className={inputClass}
                value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.description")}</label>
              <textarea rows={3} placeholder={t("pr.descPlaceholder")} className={inputClass}
                value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.descriptionAr")}</label>
              <textarea dir="rtl" rows={3} placeholder={t("pr.descPlaceholder")} className={inputClass}
                value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
            </div>

            <div className="sm:col-span-2 flex gap-3 pt-1">
              <button type="submit" disabled={loading || uploading}
                className="btn-gold !px-6 !py-2.5 !rounded-xl !text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? t("common.saving") : editingId ? t("pr.update") : t("pr.add")}
              </button>
              <button type="button" onClick={cancelEdit} className="glass-chip text-brand-tan px-5 py-2.5 rounded-xl text-sm font-medium hover:border-brand-rust/40 transition-all">
                {t("common.cancel")}
              </button>
            </div>
          </div>

          {/* Image upload panel */}
          <div>
            <label className="text-xs text-brand-tan/50 mb-1 block">{t("pr.image")}</label>

            {/* Drop zone / preview */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !form.imageUrl && fileInputRef.current?.click()}
              className={`aspect-square rounded-xl overflow-hidden relative border-2 border-dashed transition-all duration-200 cursor-pointer
                ${dragging ? "border-brand-rust bg-brand-rust/10 scale-[1.02]" : "border-white/[0.15] hover:border-brand-rust/40"}
                ${form.imageUrl ? "border-solid" : ""}
              `}
            >
              {uploading ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-2 border-brand-rust border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-brand-tan/50">{t("pr.uploading")}</span>
                </div>
              ) : form.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="bg-white text-espresso text-xs font-medium px-3 py-1.5 rounded-full shadow-lg"
                      >
                        {t("pr.replace")}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, imageUrl: "" })); }}
                        className="bg-white text-red-600 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg"
                      >
                        {t("pr.remove")}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-brand-tan/40">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <span className="text-xs text-center px-4">{t("pr.clickOrDrag")}</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.target.value = "";
              }}
            />

            {/* OR paste URL */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 h-px bg-white/[0.1]" />
                <span className="text-[10px] text-brand-tan/40 uppercase tracking-wider">{t("pr.orPaste")}</span>
                <div className="flex-1 h-px bg-white/[0.1]" />
              </div>
              <input
                type="url"
                placeholder="https://example.com/photo.jpg"
                className="w-full border border-white/[0.1] rounded-lg px-3 py-2 text-xs bg-surface text-brand-tan placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-rust/40 transition"
                value={form.imageUrl.startsWith("/uploads/") ? "" : form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>

            {/* Additional images */}
            {form.imageUrl && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-brand-tan/50">{t("pr.extraImages").replace("{n}", form.images.length.toString())}</label>
                  <button
                    type="button"
                    onClick={() => extraFileInputRef.current?.click()}
                    className="text-xs text-brand-rust font-medium hover:underline"
                  >
                    {t("pr.addImage")}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/[0.1] group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExtraImage(i)}
                        className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  ref={extraFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleExtraFileSelect(file);
                    e.target.value = "";
                  }}
                />
              </div>
            )}
          </div>
        </form>
      </AdminModal>

      {/* Delete confirm modal */}
      <AdminModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={t("pr.deleteTitle")}
        subtitle={deleteTarget ? t("pr.deleteSubtitle").replace("{name}", deleteTarget.name) : ""}
        size="sm"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            {t("pr.confirmDelete")}
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
