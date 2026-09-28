import { StyleSheet, Text, View } from "react-native";
import { OrderStatus } from "../types";

const COLORS: Record<OrderStatus, string> = {
  PENDING: "#b7791f",
  PAID: "#2563eb",
  SHIPPED: "#6b46c1",
  DELIVERED: "#2f855a",
  CANCELLED: "#c0392b",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: COLORS[status] + "22" }]}>
      <Text style={[styles.text, { color: COLORS[status] }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  text: { fontSize: 12, fontWeight: "700" },
});
