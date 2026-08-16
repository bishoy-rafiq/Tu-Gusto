import { supabase } from "./supabase";
import type { Review } from "@/domain/entities";
import type { ReviewRepository } from "@/domain/repositories";

export const supabaseReviewRepository: ReviewRepository = {
  async listForProduct(productId) {
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("productId", productId)
      .order("createdAt", { ascending: false });
    return (data ?? []) as Review[];
  },

  async create(data) {
    const { data: review, error } = await supabase
      .from("reviews")
      .insert(data)
      .select("*")
      .single();
    if (error || !review) throw new Error("Could not save review");
    return review as Review;
  },

  async exists(id) {
    const { data } = await supabase
      .from("reviews")
      .select("id")
      .eq("id", id)
      .maybeSingle();
    return Boolean(data);
  },

  async remove(id) {
    await supabase.from("reviews").delete().eq("id", id);
  },
};
