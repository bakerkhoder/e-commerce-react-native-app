import { apiClient } from "../../../api/client";
import { Product } from "../../catalog/types";

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  stockQuantity: number;
  unit: string;
  attributes: Record<string, any>;
}

export const adminApi = {
  createProduct: (data: ProductPayload) =>
    apiClient.post<Product>("/products", data).then((r) => r.data),
  updateProduct: (id: number, data: ProductPayload) =>
    apiClient.put<Product>(`/products/${id}`, data).then((r) => r.data),
  deleteProduct: (id: number) => apiClient.delete(`/products/${id}`),
};
