import { apiClient } from "../../../api/client";
import { Dashboard, LedgerPayload } from "../types";

export const dashboardApi = {
  get: (days: number) =>
    apiClient
      .get<Dashboard>("/dashboard", { params: { days } })
      .then((r) => r.data),

  aiPlan: (days: number) =>
    apiClient
      .post<{ plan: string }>("/dashboard/ai-plan", null, { params: { days } })
      .then((r) => r.data),

  record: (payload: LedgerPayload) =>
    apiClient.post("/ledger", payload).then((r) => r.data),
};

export const analyticsApi = {
  /**
   * Fire-and-forget view ping. Deliberately swallows failures: analytics must never
   * break a product page.
   */
  recordView: (productId: number) =>
    apiClient.post(`/analytics/views/${productId}`).catch(() => {}),
};
