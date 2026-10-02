import { apiClient } from "../../../api/client";
import { User } from "../../auth/types";

export const profileApi = {
  updateProfile: (fullName: string) =>
    apiClient.put<User>("/users/me", { fullName }).then((r) => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put("/users/me/password", { currentPassword, newPassword }),
  getMe: () =>
    apiClient
      .get<{
        defaultPhone: string | null;
        defaultCity: string | null;
        defaultAddressLine: string | null;
      }>("/users/me")
      .then((r) => r.data),
};
