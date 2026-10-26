import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { I18nManager } from "react-native";
import { ar, TranslationKey } from "./locales/ar";
import { en } from "./locales/en";

export type Language = "ar" | "en";

const DICTIONARIES: Record<Language, Record<TranslationKey, string>> = {
  ar,
  en,
};

/** Arabic is the app's first language; English is an opt-in switch. */
export const DEFAULT_LANGUAGE: Language = "ar";
const STORAGE_KEY = "appLanguage";

export const isRTL = (language: Language) => language === "ar";

type Params = Record<string, string | number>;

interface I18nValue {
  language: Language;
  /** True while the saved preference is still being read from storage. */
  isReady: boolean;
  /** Switches language. Returns true when a reload is required to apply direction. */
  setLanguage: (language: Language) => Promise<boolean>;
  t: (key: TranslationKey, params?: Params) => string;
  /** BCP 47 tag, for Intl formatters and date/number localisation. */
  locale: string;
  /** Text direction of the selected language. */
  direction: "rtl" | "ltr";
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

/**
 * Replaces {name} placeholders. Values are escaped by construction: this only ever
 * composes strings already in the dictionaries, never HTML.
 */
function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  // Read the saved preference once. Arabic stays the default until we know better,
  // so there is no English flash on a cold start.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === "ar" || saved === "en") setLanguageState(saved);
      })
      .catch(() => {
        // storage unavailable: keep the default rather than blocking startup
      })
      .finally(() => setIsReady(true));
  }, []);

  const setLanguage = useCallback(
    async (next: Language): Promise<boolean> => {
      await AsyncStorage.setItem(STORAGE_KEY, next);
      setLanguageState(next);

      // Text swaps immediately, but layout direction is baked into the native shell at
      // launch. Tell the caller a reload is needed only when the direction actually
      // differs from the currently running one.
      const wantsRTL = isRTL(next);
      const directionChanged = wantsRTL !== I18nManager.isRTL;
      if (!directionChanged) return false;

      I18nManager.allowRTL(wantsRTL);
      I18nManager.forceRTL(wantsRTL);
      return true;
    },
    [],
  );

  const value = useMemo<I18nValue>(() => {
    const dictionary = DICTIONARIES[language];
    return {
      language,
      isReady,
      setLanguage,
      locale: language === "ar" ? "ar-LB" : "en-US",
      direction: isRTL(language) ? "rtl" : "ltr",
      t: (key, params) => interpolate(dictionary[key] ?? key, params),
    };
  }, [language, isReady, setLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Access the current language and the `t` translator. */
export function useTranslation(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used inside <I18nProvider>");
  }
  return ctx;
}

/** Convenience for components that only need to translate. */
export function useT() {
  return useTranslation().t;
}
