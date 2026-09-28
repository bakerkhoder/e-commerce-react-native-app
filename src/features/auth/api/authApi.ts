import { apiClient } from "../../../api/client";
import { AuthResponse } from "../types";

export const authApi = {
  register: (email: string, password: string, fullName: string) =>
    apiClient
      .post<AuthResponse>("/auth/register", { email, password, fullName })
      .then((r) => r.data),
  login: (email: string, password: string) =>
    apiClient
      .post<AuthResponse>("/auth/login", { email, password })
      .then((r) => r.data),
};
