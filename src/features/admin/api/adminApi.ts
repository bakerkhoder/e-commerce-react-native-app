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
  addImage: (productId: number, uri: string) => {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);
    return apiClient
      .post<Product>(`/products/${productId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  removeImage: (productId: number, imageId: number) =>
    apiClient
      .delete<Product>(`/products/${productId}/images/${imageId}`)
      .then((r) => r.data),
};
