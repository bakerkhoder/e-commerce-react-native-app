import { apiClient } from "../../../api/client";

export const assistantApi = {
  ask: (question: string) =>
    apiClient
      .get<string>(`/assistant/ask?question=${encodeURIComponent(question)}`)
      .then((r) => r.data),
};
