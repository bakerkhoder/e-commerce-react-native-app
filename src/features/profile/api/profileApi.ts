import { apiClient } from "../../../api/client";
import { User } from "../../auth/types";

export const profileApi = {
  updateProfile: (fullName: string) =>
    apiClient.put<User>("/users/me", { fullName }).then((r) => r.data),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.put("/users/me/password", { currentPassword, newPassword }),
};
