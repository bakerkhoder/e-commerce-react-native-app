import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const KEY = "authToken";

/**
 * The JWT lives in the OS keystore on device, not in plain AsyncStorage.
 *
 * expo-secure-store is native-only (Android/iOS/tvOS) and throws on web, so the web
 * build falls back to localStorage. That fallback is not secure storage — it exists so
 * an Expo web build keeps working; treat web as a development target only.
 */
const webStorage = {
  get: async (): Promise<string | null> => {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(KEY);
  },
  set: async (token: string): Promise<void> => {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(KEY, token);
  },
  clear: async (): Promise<void> => {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(KEY);
  },
};

const nativeStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (token: string) => SecureStore.setItemAsync(KEY, token),
  clear: () => SecureStore.deleteItemAsync(KEY),
};

const useNativeStore = Platform.OS === "ios" || Platform.OS === "android";

export const tokenStorage = {
  get: () => (useNativeStore ? nativeStorage.get() : webStorage.get()),
  set: (token: string) =>
    useNativeStore ? nativeStorage.set(token) : webStorage.set(token),
  clear: () => (useNativeStore ? nativeStorage.clear() : webStorage.clear()),
};
