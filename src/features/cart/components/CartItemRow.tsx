import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartLine } from "../context/CartContext";

interface Props {
  item: CartLine;
  onChangeQuantity: (productId: number, quantity: number) => void;
}

export function CartItemRow({ item, onChangeQuantity }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.unitPrice}>${item.unitPrice.toFixed(2)} each</Text>
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => onChangeQuantity(item.productId, item.quantity - 1)}
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable
            style={[
              styles.stepBtn,
              item.quantity >= item.maxStock && styles.stepBtnDisabled,
            ]}
            onPress={() =>
              item.quantity < item.maxStock &&
              onChangeQuantity(item.productId, item.quantity + 1)
            }
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
          <Pressable
            onPress={() => onChangeQuantity(item.productId, 0)}
            style={styles.removeLink}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.lineTotal}>
        ${(item.unitPrice * item.quantity).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: { fontSize: 15, fontWeight: "600" },
  unitPrice: { fontSize: 12, color: "#999", marginTop: 2 },
  stepper: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 4 },
  stepBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  stepBtnDisabled: { opacity: 0.3 },
  stepText: { fontSize: 16, fontWeight: "600" },
  qty: { width: 28, textAlign: "center", fontSize: 15 },
  removeLink: { marginLeft: 12 },
  removeText: { color: "#c0392b", fontSize: 13 },
  lineTotal: { fontSize: 15, fontWeight: "600", marginLeft: 8 },
});
