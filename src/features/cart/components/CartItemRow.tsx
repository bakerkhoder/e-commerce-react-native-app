import { Pressable, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CartLine } from "../context/CartContext";
import { ProductImage } from "@/shared/components/ProductImage";
import { AppText } from "@/shared/components/AppText";
import { Stepper } from "@/shared/components/Stepper";
import { colors, space } from "@/shared/theme";
import { formatCurrency } from "@/shared/utils/format";

export function CartItemRow({
  item,
  onChangeQuantity,
}: {
  item: CartLine;
  onChangeQuantity: (productId: number, quantity: number) => void;
}) {
  return (
    <View style={s.row}>
      <ProductImage url={item.thumbnailUrl} size={76} />
      <View style={s.mid}>
        <AppText variant="heading" numberOfLines={2}>
          {item.productName}
        </AppText>
        <AppText variant="small" color={colors.muted}>
          {formatCurrency(item.unitPrice)} each
        </AppText>
        <View style={{ marginTop: 6, alignSelf: "flex-start" }}>
          <Stepper
            value={item.quantity}
            min={0}
            max={item.maxStock}
            onChange={(v) => onChangeQuantity(item.productId, v)}
          />
        </View>
      </View>
      <View style={s.right}>
        <AppText variant="price">
          {formatCurrency(item.unitPrice * item.quantity)}
        </AppText>
        <Pressable
          hitSlop={10}
          accessibilityLabel={`Remove ${item.productName}`}
          onPress={() => onChangeQuantity(item.productId, 0)}
        >
          <Feather name="trash-2" size={18} color={colors.tomato} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: space.md, paddingVertical: space.md },
  mid: { flex: 1, gap: 2 },
  right: { alignItems: "flex-end", justifyContent: "space-between" },
});
