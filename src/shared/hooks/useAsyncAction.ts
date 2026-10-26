import { useRef, useState } from "react";
import { Alert } from "react-native";
import { useTranslation } from "../../i18n";
import type { TranslationKey } from "../../i18n/locales/ar";

/**
 * Turns anything thrown by the API layer into a message worth showing a user.
 *
 * The backend answers every rejected restriction with {"message": "..."} — the 1..99
 * quantity cap, a short password, the 10-photo limit, rate limiting — so prefer that
 * text. Only when the server sent none do we fall back to a translated message.
 */
export function apiErrorMessage(
  err: unknown,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
  fallbackKey: TranslationKey = "error.generic",
): string {
  const response = (err as any)?.response;
  const serverMessage = response?.data?.message;

  if (response?.status === 429) return t("error.rateLimited");
  if (!response) return t("error.offline");
  if (response.status >= 500) return t("error.server");

  if (typeof serverMessage === "string" && serverMessage.trim()) {
    return serverMessage;
  }
  return t(fallbackKey);
}

/**
 * Wraps an async action with a double-tap lock and a translated error alert.
 *
 * Error titles and fallbacks are translation *keys*, not strings, so they follow the
 * selected language.
 */
export function useAsyncAction<A extends unknown[]>(
  action: (...args: A) => Promise<void>,
  options: {
    errorTitleKey?: TranslationKey;
    fallbackMessageKey?: TranslationKey;
  } = {},
) {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const { t } = useTranslation();

  async function run(...args: A) {
    if (locked.current) return; // blocks a second tap before React re-renders
    locked.current = true;
    setPending(true);
    try {
      await action(...args);
    } catch (err) {
      Alert.alert(
        t(options.errorTitleKey ?? "common.error"),
        apiErrorMessage(err, t, options.fallbackMessageKey),
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }

  return { run, pending };
}
