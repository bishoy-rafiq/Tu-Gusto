import type { Review } from "@/domain/entities";
import type { ReviewRepository } from "@/domain/repositories";

export interface ReviewUseCases {
  listForProduct(productId: string): Promise<{ reviews: Review[]; average: number; count: number }>;
  add(input: {
    productId: string;
    name: string;
    rating: number;
    text: string;
  }): Promise<Review>;
  remove(id: string): Promise<void>;
}

export function createReviewUseCases(deps: {
  reviews: ReviewRepository;
}): ReviewUseCases {
  return {
    async listForProduct(productId) {
      const list = await deps.reviews.listForProduct(productId);
      const avg =
        list.length > 0
          ? list.reduce((s, r) => s + Number(r.rating), 0) / list.length
          : 0;
      return { reviews: list, average: Math.round(avg * 10) / 10, count: list.length };
    },

    add(input) {
      return deps.reviews.create(input);
    },

    async remove(id) {
      const exists = await deps.reviews.exists(id);
      if (!exists) throw new Error("Review not found");
      await deps.reviews.remove(id);
    },
  };
}
