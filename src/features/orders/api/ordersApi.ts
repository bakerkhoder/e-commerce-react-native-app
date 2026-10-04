import { apiClient } from "../../../api/client";
import { CheckoutPayload, GuestCheckoutPayload, Order } from "../types";

export const ordersApi = {
  checkout: (payload: CheckoutPayload) =>
    apiClient.post<Order>("/orders/checkout", payload).then((r) => r.data),
  getOrders: () => apiClient.get<Order[]>("/orders").then((r) => r.data),
  getOrder: (id: number) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),
  getAllOrders: () => apiClient.get<Order[]>("/orders/all").then((r) => r.data),
  updateStatus: (id: number, status: string) =>
    apiClient
      .put<Order>(`/orders/${id}/status`, { status })
      .then((r) => r.data),

  guestCheckout: (payload: GuestCheckoutPayload) =>
    apiClient
      .post<Order>("/orders/guest-checkout", payload)
      .then((r) => r.data),
};
