import { apiClient } from "../../../api/client";
import { Order } from "../types";

export const ordersApi = {
  checkout: () => apiClient.post<Order>("/orders/checkout").then((r) => r.data),
  getOrders: () => apiClient.get<Order[]>("/orders").then((r) => r.data),
  getOrder: (id: number) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),
};
