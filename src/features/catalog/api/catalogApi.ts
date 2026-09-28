import { apiClient } from "../../../api/client";
import { Category, Product } from "../types";
export const catalogApi = {
  getProducts: () => apiClient.get<Product[]>("/products").then((r) => r.data),
  getCategories: () =>
    apiClient.get<Category[]>("/categories").then((r) => r.data),
  search: (q: string) =>
    apiClient.get(`/search?q=${encodeURIComponent(q)}`).then((r) => r.data),
};
