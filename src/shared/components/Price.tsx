import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors } from "../theme";
import { formatCurrency } from "../utils/format";

/** The lemon price sticker. */
export function Price({ value, unit }: { value: number; unit?: string | null }) {
  return (
    <View style={s.sticker}>
      <AppText variant="price">{formatCurrency(value)}</AppText>
      {unit ? <AppText variant="small">/{unit}</AppText> : null}
    </View>
  );
}

const s = StyleSheet.create({
  sticker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-start",
    backgroundColor: colors.lemon,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
});
