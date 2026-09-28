import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { formatCurrency, formatDate } from "../../../shared/utils/format";
import { ordersApi } from "../api/ordersApi";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { Order } from "../types";

export function OrderDetailScreen({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getOrder(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  if (!order)
    return (
      <View style={styles.center}>
        <Text>Order not found.</Text>
      </View>
    );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order #{order.id}</Text>
        <OrderStatusBadge status={order.status} />
      </View>
      <Text style={styles.meta}>Placed {formatDate(order.createdAt)}</Text>

      <View style={styles.items}>
        {order.items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.meta}>
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </Text>
            </View>
            <Text style={styles.itemTotal}>
              {formatCurrency(item.unitPrice * item.quantity)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {formatCurrency(order.totalAmount)}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "700" },
  meta: { fontSize: 13, color: "#777", marginTop: 2 },
  items: { marginTop: 20 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemName: { fontSize: 15, fontWeight: "600" },
  itemTotal: { fontSize: 15, fontWeight: "500" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  totalLabel: { fontSize: 18, fontWeight: "700" },
  totalValue: { fontSize: 18, fontWeight: "700" },
});
