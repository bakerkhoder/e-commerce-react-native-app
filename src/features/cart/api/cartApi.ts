import { apiClient } from "../../../api/client";
import { Cart } from "../types";

export const cartApi = {
  getCart: () => apiClient.get<Cart>("/cart").then((r) => r.data),
  addItem: (productId: number, quantity: number) =>
    apiClient
      .post<Cart>(`/cart/items?productId=${productId}&quantity=${quantity}`)
      .then((r) => r.data),
  removeItem: (productId: number) =>
    apiClient.delete<Cart>(`/cart/items/${productId}`).then((r) => r.data),
  setQuantity: (productId: number, quantity: number) =>
    apiClient
      .put<Cart>(`/cart/items/${productId}`, { quantity })
      .then((r) => r.data),
};
