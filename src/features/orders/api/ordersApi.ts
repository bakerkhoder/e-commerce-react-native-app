import { apiClient } from "../../../api/client";
import { Order } from "../types";

export const ordersApi = {
  checkout: () => apiClient.post<Order>("/orders/checkout").then((r) => r.data),
};
