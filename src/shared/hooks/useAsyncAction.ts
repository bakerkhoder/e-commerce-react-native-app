import { useRef, useState } from "react";
import { Alert } from "react-native";

export function useAsyncAction<A extends unknown[]>(
  action: (...args: A) => Promise<void>,
  options: { errorTitle?: string; fallbackMessage?: string } = {},
) {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);

  async function run(...args: A) {
    if (locked.current) return; // blocks a second tap before React re-renders
    locked.current = true;
    setPending(true);
    try {
      await action(...args);
    } catch (err: any) {
      Alert.alert(
        options.errorTitle ?? "Something went wrong",
        err?.response?.data?.message ??
          options.fallbackMessage ??
          "Please try again.",
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }

  return { run, pending };
}
