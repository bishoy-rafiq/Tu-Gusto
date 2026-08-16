import { supabase } from "./supabase";
import type { Product } from "@/domain/entities";
import type {
  CreateProductInput,
  ProductRepository,
  UpdateProductInput,
} from "@/domain/repositories";

function toProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar ?? "",
    slug: row.slug,
    description: row.description,
    descriptionAr: row.description_ar ?? null,
    price: row.price,
    originalPrice: row.originalPrice ?? null,
    category: row.category ?? null,
    imageUrl: row.imageUrl ?? null,
    images: row.images ?? [],
    stock: Number(row.stock ?? 0),
    views: Number(row.views ?? 0),
    createdAt: row.createdAt,
  };
}

function toDbPatch(data: UpdateProductInput) {
  const patch: Record<string, unknown> = { ...data };
  if (data.nameAr !== undefined) {
    patch.name_ar = data.nameAr;
    delete patch.nameAr;
  }
  if (data.descriptionAr !== undefined) {
    patch.description_ar = data.descriptionAr;
    delete patch.descriptionAr;
  }
  return patch;
}

export const supabaseProductRepository: ProductRepository = {
  async listTopByViews(limit) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("views", { ascending: false })
      .limit(limit);
    return (data ?? []).map(toProduct);
  },

  async listByCreatedDesc() {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("createdAt", { ascending: false });
    return (data ?? []).map(toProduct);
  },

  async listByCategoryExcluding(category, excludeSlug, limit) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .neq("slug", excludeSlug)
      .order("views", { ascending: false })
      .limit(limit);
    return (data ?? []).map(toProduct);
  },

  async listOtherThanCategory(category, excludeSlug, limit) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .neq("slug", excludeSlug)
      .neq("category", category)
      .order("views", { ascending: false })
      .limit(limit);
    return (data ?? []).map(toProduct);
  },

  async getBySlug(slug) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data ? toProduct(data) : null;
  },

  async getById(id) {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return data ? toProduct(data) : null;
  },

  async getManyByIds(ids) {
    if (ids.length === 0) return [];
    const { data } = await supabase.from("products").select("*").in("id", ids);
    return (data ?? []).map(toProduct);
  },

  async listSlugs() {
    const { data } = await supabase.from("products").select("slug");
    return (data ?? [])
      .map((p) => p.slug)
      .filter((slug): slug is string => Boolean(slug));
  },

  async incrementViews(id) {
    const { data: product } = await supabase
      .from("products")
      .select("views")
      .eq("id", id)
      .maybeSingle();
    const views = Number(product?.views ?? 0) + 1;
    const { data: updated } = await supabase
      .from("products")
      .update({ views })
      .eq("id", id)
      .select("views")
      .single();
    return Number(updated?.views ?? views);
  },

  async namesByIds(ids) {
    if (ids.length === 0) return {};
    const { data } = await supabase.from("products").select("id, name").in("id", ids);
    return Object.fromEntries((data ?? []).map((p) => [p.id, p.name as string]));
  },

  async create(data: CreateProductInput) {
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: data.name,
        name_ar: data.nameAr ?? "",
        slug: data.slug,
        description: data.description,
        description_ar: data.descriptionAr ?? "",
        price: data.price,
        originalPrice: data.originalPrice || null,
        category: data.category,
        imageUrl: data.imageUrl,
        images: data.images || [],
        stock: data.stock,
      })
      .select("*")
      .single();
    if (error || !product) throw new Error("Could not create product");
    return toProduct(product);
  },

  async update(id: string, data: UpdateProductInput) {
    const { data: product, error } = await supabase
      .from("products")
      .update(toDbPatch(data))
      .eq("id", id)
      .select("*")
      .single();
    if (error || !product) return null;
    return toProduct(product);
  },

  async remove(id) {
    await supabase.from("products").delete().eq("id", id);
  },

  async addStock(id, quantity) {
    const { data: p, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();
    if (error || !p) throw new Error("Could not update stock");
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: Number(p.stock) + quantity })
      .eq("id", id);
    if (updateError) throw new Error("Could not update stock");
  },

  async removeStock(id, quantity) {
    const { data: p, error } = await supabase
      .from("products")
      .select("stock")
      .eq("id", id)
      .single();
    if (error || !p) throw new Error("Could not update stock");
    const newStock = Number(p.stock) - quantity;
    if (newStock < 0) throw new Error("Insufficient stock");
    const { error: updateError } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", id);
    if (updateError) throw new Error("Could not update stock");
  },
};
