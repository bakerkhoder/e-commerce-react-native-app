import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartItem } from "../types";

export function CartItemRow({
  item,
  onRemove,
}: {
  item: CartItem;
  onRemove: (productId: number) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.details}>
          {item.quantity} × ${item.unitPrice.toFixed(2)}
        </Text>
      </View>
      <Text style={styles.lineTotal}>
        ${(item.unitPrice * item.quantity).toFixed(2)}
      </Text>
      <Pressable
        onPress={() => onRemove(item.productId)}
        style={styles.removeButton}
      >
        <Text style={styles.removeText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: { fontSize: 15, fontWeight: "600" },
  details: { fontSize: 13, color: "#888", marginTop: 2 },
  lineTotal: { fontSize: 15, fontWeight: "500", marginRight: 12 },
  removeButton: { padding: 6 },
  removeText: { color: "#c0392b", fontSize: 16 },
});
