import { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { colors, radius } from "../theme";

const PALETTE = {
  primary: { bg: colors.sea, fg: colors.onSea, border: colors.sea },
  secondary: { bg: colors.surface, fg: colors.sea, border: colors.sea },
  quiet: { bg: "transparent", fg: colors.ink, border: "transparent" },
  danger: { bg: colors.tomatoSoft, fg: colors.tomato, border: "transparent" },
} as const;

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: keyof typeof PALETTE;
  loading?: boolean;
  disabled?: boolean;
  icon?: ComponentProps<typeof Feather>["name"];
  style?: StyleProp<ViewStyle>;
}) {
  const p = PALETTE[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled || !!loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.base,
        {
          backgroundColor: p.bg,
          borderColor: p.border,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <>
          {icon && <Feather name={icon} size={18} color={p.fg} />}
          {/* Centred explicitly: the label's default alignment follows the text
              direction, which would left/right-align it inside a centred button. */}
          <AppText variant="button" color={p.fg} style={s.label}>
            {label}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.button,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: { textAlign: "center", flexShrink: 1 },
});
