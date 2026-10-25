import { Children, ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { colors, radius } from "../theme";

export function ListGroup({ children }: { children: ReactNode }) {
  return (
    <View style={s.group}>
      {Children.toArray(children).map((c, i) => (
        <View key={i}>
          {i > 0 && <View style={s.divider} />}
          {c}
        </View>
      ))}
    </View>
  );
}

export function ListRow({
  icon,
  label,
  detail,
  onPress,
  tone = "normal",
}: {
  icon: ComponentProps<typeof Feather>["name"];
  label: string;
  detail?: string;
  onPress: () => void;
  tone?: "normal" | "danger";
}) {
  const color = tone === "danger" ? colors.tomato : colors.ink;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.row, pressed && { backgroundColor: colors.chalk }]}
    >
      <Feather name={icon} size={20} color={color} />
      <View style={{ flex: 1 }}>
        <AppText variant="heading" color={color}>
          {label}
        </AppText>
        {detail ? (
          <AppText variant="small" color={colors.muted}>
            {detail}
          </AppText>
        ) : null}
      </View>
      {tone === "normal" && (
        <Feather name="chevron-right" size={18} color={colors.muted} />
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.image,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginLeft: 50,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
});
