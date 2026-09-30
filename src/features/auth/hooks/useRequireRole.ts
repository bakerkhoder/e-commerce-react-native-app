import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Role } from "../types";

export function useRequireRole(allowedRoles: Role[]) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!user || !allowedRoles.includes(user.role))) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  return !!user && allowedRoles.includes(user.role);
}
