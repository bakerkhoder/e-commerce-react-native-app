import { router } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export function useRequireAdmin() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.role !== "ADMIN") {
      router.replace("/(tabs)");
    }
  }, [user, isLoading]);

  return user?.role === "ADMIN";
}
