import { apiClient } from "../../../api/client";

export interface SellerApplication {
  id: number;
  userId: number;
  businessName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
}

export const sellerApplicationApi = {
  apply: (businessName: string) =>
    apiClient.post("/users/me/seller-application", { businessName }),
  getPending: () =>
    apiClient
      .get<SellerApplication[]>("/users/me/seller-applications/pending")
      .then((r) => r.data),
  approve: (id: number) =>
    apiClient.put(`/users/me/seller-applications/${id}/approve`),
  reject: (id: number) =>
    apiClient.put(`/users/me/seller-applications/${id}/reject`),
};
