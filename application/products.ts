import type { Product } from "@/domain/entities";
import type {
  CreateProductInput,
  ProductRepository,
  UpdateProductInput,
} from "@/domain/repositories";

export interface ProductUseCases {
  listFeatured(limit: number): Promise<Product[]>;
  listAll(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getRelated(product: Product, slug: string): Promise<Product[]>;
  listSlugs(): Promise<string[]>;
  incrementViews(id: string): Promise<number>;
  create(data: CreateProductInput): Promise<Product>;
  update(id: string, data: UpdateProductInput): Promise<Product | null>;
  remove(id: string): Promise<void>;
}

export function createProductUseCases(deps: {
  products: ProductRepository;
}): ProductUseCases {
  return {
    listFeatured: (limit) => deps.products.listTopByViews(limit),

    listAll: () => deps.products.listByCreatedDesc(),

    getBySlug: (slug) => deps.products.getBySlug(slug),

    async getRelated(product, slug) {
      try {
        const category = product.category;
        const sameCategory = await deps.products.listByCategoryExcluding(
          category as string,
          slug,
          4
        );
        if (sameCategory.length >= 4) return sameCategory;

        const others = await deps.products.listOtherThanCategory(
          category as string,
          slug,
          4 - sameCategory.length
        );
        return [...sameCategory, ...others];
      } catch {
        return [];
      }
    },

    listSlugs: () => deps.products.listSlugs(),

    incrementViews: (id) => deps.products.incrementViews(id),

    create: (data) => deps.products.create(data),

    update: (id, data) => deps.products.update(id, data),

    remove: (id) => deps.products.remove(id),
  };
}
