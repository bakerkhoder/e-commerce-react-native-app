import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { formatCurrency, formatDate } from "../../../shared/utils/format";
import { useAuth } from "../../auth/context/AuthContext";
import { ordersApi } from "../api/ordersApi";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { Order } from "../types";

export function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setOrders(await ordersApi.getOrders());
    } catch {
      setError("Could not load your orders.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }
      load().finally(() => setLoading(false));
    }, [user, load]),
  );

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Log in to see your orders.</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          {error ?? "You haven't placed any orders yet."}
        </Text>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/orders/${item.id}`)}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.title}>Order #{item.id}</Text>
            <OrderStatusBadge status={item.status} />
          </View>
          <Text style={styles.meta}>{formatDate(item.createdAt)}</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.meta}>
              {item.items.length} item{item.items.length === 1 ? "" : "s"}
            </Text>
            <Text style={styles.total}>{formatCurrency(item.totalAmount)}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 16, fontWeight: "700" },
  meta: { fontSize: 13, color: "#777" },
  total: { fontSize: 16, fontWeight: "700" },
});
