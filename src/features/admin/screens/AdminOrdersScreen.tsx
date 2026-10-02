import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { formatCurrency, formatDate } from "../../../shared/utils/format";
import { ordersApi } from "../../orders/api/ordersApi";
import { OrderStatusBadge } from "../../orders/components/OrderStatusBadge";
import { Order, OrderStatus } from "../../orders/types";

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "PAID",
  PAID: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

function buildWhatsAppLink(order: Order): string {
  const digits = order.shippingAddress.phone.replace(/[^\d]/g, "");
  const message =
    `Hello ${order.shippingAddress.fullName}, this is regarding your order #${order.id} ` +
    `(${formatCurrency(order.totalAmount)}, ${order.paymentMethod.replace("_", " ")}). ` +
    `We'd like to confirm your delivery details.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  useFocusEffect(
    useCallback(() => {
      ordersApi.getAllOrders().then(setOrders);
    }, []),
  );

  async function advanceStatus(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const updated = await ordersApi.updateStatus(order.id, next);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
  }

  async function cancelOrder(order: Order) {
    Alert.alert(
      "Cancel order?",
      `Order #${order.id} will be marked cancelled.`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: async () => {
            const updated = await ordersApi.updateStatus(order.id, "CANCELLED");
            setOrders((prev) =>
              prev.map((o) => (o.id === order.id ? updated : o)),
            );
          },
        },
      ],
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={styles.empty}>No orders yet.</Text>}
      renderItem={({ item }) => {
        const next = NEXT_STATUS[item.status];
        return (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.title}>Order #{item.id}</Text>
              <OrderStatusBadge status={item.status} />
            </View>
            <Text style={styles.meta}>
              {formatDate(item.createdAt)} ·{" "}
              {item.paymentMethod.replace("_", " ")}
            </Text>
            <Text style={styles.meta}>
              {item.shippingAddress.fullName} · {item.shippingAddress.phone}
            </Text>
            <Text style={styles.meta}>
              {item.shippingAddress.addressLine}, {item.shippingAddress.city}
            </Text>
            <Text style={styles.total}>{formatCurrency(item.totalAmount)}</Text>

            <View style={styles.actions}>
              <Pressable
                style={styles.whatsapp}
                onPress={() => Linking.openURL(buildWhatsAppLink(item))}
              >
                <Text style={styles.actionText}>WhatsApp Buyer</Text>
              </Pressable>
              {next && (
                <Pressable
                  style={styles.advance}
                  onPress={() => advanceStatus(item)}
                >
                  <Text style={styles.actionText}>Mark {next}</Text>
                </Pressable>
              )}
              {item.status !== "CANCELLED" && item.status !== "DELIVERED" && (
                <Pressable
                  style={styles.cancel}
                  onPress={() => cancelOrder(item)}
                >
                  <Text style={styles.actionText}>Cancel</Text>
                </Pressable>
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    gap: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  meta: { fontSize: 13, color: "#777" },
  total: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" },
  whatsapp: {
    backgroundColor: "#25D366",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  advance: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancel: {
    backgroundColor: "#c0392b",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
