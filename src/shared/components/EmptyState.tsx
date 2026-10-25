import { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { colors, space } from "../theme";

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: ComponentProps<typeof Feather>["name"];
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={s.wrap}>
      <View style={s.badge}>
        <Feather name={icon} size={26} color={colors.sea} />
      </View>
      <AppText variant="title" style={{ textAlign: "center" }}>
        {title}
      </AppText>
      <AppText color={colors.muted} style={{ textAlign: "center" }}>
        {message}
      </AppText>
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          style={{ alignSelf: "stretch", marginTop: space.sm }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    padding: space.xxl,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.seaSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: space.sm,
  },
});
