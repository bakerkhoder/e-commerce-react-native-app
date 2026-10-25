import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { colors, radius } from "../theme";

export function Stepper({
  value,
  min = 1,
  max,
  onChange,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={s.wrap}>
      <Pressable
        style={[s.btn, value <= min && s.off]}
        disabled={value <= min}
        hitSlop={6}
        accessibilityLabel="Decrease quantity"
        onPress={() => onChange(value - 1)}
      >
        <Feather name="minus" size={16} color={colors.ink} />
      </Pressable>
      <AppText variant="heading" style={s.value}>
        {value}
      </AppText>
      <Pressable
        style={[s.btn, value >= max && s.off]}
        disabled={value >= max}
        hitSlop={6}
        accessibilityLabel="Increase quantity"
        onPress={() => onChange(value + 1)}
      >
        <Feather name="plus" size={16} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  btn: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  off: { opacity: 0.3 },
  value: { minWidth: 26, textAlign: "center" },
});
