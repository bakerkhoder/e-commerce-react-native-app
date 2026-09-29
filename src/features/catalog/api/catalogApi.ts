import { apiClient } from "../../../api/client";
import { Category, Product } from "../types";

export const catalogApi = {
  getProducts: (categoryId?: number) =>
    apiClient
      .get<Product[]>("/products", { params: categoryId ? { categoryId } : {} })
      .then((r) => r.data),
  getProduct: (id: number) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),
  getCategories: () =>
    apiClient.get<Category[]>("/categories").then((r) => r.data),
  search: (q: string, categoryId?: number) =>
    apiClient
      .get<
        Product[]
      >("/search", { params: categoryId ? { q, categoryId } : { q } })
      .then((r) => r.data),
};
