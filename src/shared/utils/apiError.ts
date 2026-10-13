import { Alert } from "react-native";

/**
 * Turns anything thrown by the API layer into a message worth showing a user.
 *
 * The backend answers every rejected restriction with {"message": "..."} — the 1..99
 * quantity cap, a short password, the 10-photo limit, rate limiting — so prefer that
 * text and fall back to something sensible for network failures and 5xx.
 */
export function apiErrorMessage(
  err: unknown,
  fallback = "Please try again.",
): string {
  const response = (err as any)?.response;
  const serverMessage = response?.data?.message;
  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }

  if (response?.status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }
  if (!response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  if (response.status >= 500) {
    return "Something went wrong on our side. Please try again.";
  }
  return fallback;
}

/** Convenience wrapper for the many screens that just want an alert. */
export function showApiError(
  err: unknown,
  title = "Something went wrong",
  fallback?: string,
): void {
  Alert.alert(title, apiErrorMessage(err, fallback));
}
