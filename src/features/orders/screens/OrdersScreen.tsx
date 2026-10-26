import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { apiErrorMessage } from "@/shared/utils/apiError";
import { useTranslation } from "@/i18n";
import { AppText } from "@/shared/components/AppText";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAuth } from "../../auth/context/AuthContext";
import { ordersApi } from "../api/ordersApi";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { Order } from "../types";
import { colors, radius, space } from "@/shared/theme";

export function OrdersScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setOrders(await ordersApi.getOrders());
    } catch (err) {
      setError(apiErrorMessage(err, t, "orders.loadFailed"));
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
      <EmptyState
        icon="user"
        title={t("account.notLoggedTitle")}
        message={t("orders.notLoggedMessage")}
        action={{ label: t("account.login"), onPress: () => router.replace("/auth/login") }}
      />
    );
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.sea} />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="package"
        title={error ? t("orders.loadFailedTitle2") : t("orders.emptyTitle")}
        message={
          error ?? t("orders.emptyBody")
        }
        action={
          error
            ? { label: t("common.retry"), onPress: handleRefresh }
            : { label: t("orders.browseShop"), onPress: () => router.push("/(tabs)") }
        }
      />
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id.toString()}
      contentContainerStyle={{ padding: space.lg, gap: space.md }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.sea}
          colors={[colors.sea]}
        />
      }
      renderItem={({ item }) => (
        <Pressable
          style={s.card}
          accessibilityRole="button"
          onPress={() => router.push(`/orders/${item.id}`)}
        >
          <View style={s.rowBetween}>
            <AppText variant="heading">Order #{item.id}</AppText>
            <OrderStatusBadge status={item.status} />
          </View>
          <AppText variant="small" color={colors.muted}>
            {formatDate(item.createdAt)}
          </AppText>
          <View style={s.divider} />
          <View style={s.rowBetween}>
            <View style={s.itemsRow}>
              <Feather name="shopping-bag" size={14} color={colors.muted} />
              <AppText variant="small" color={colors.muted}>
                {item.items.length} item{item.items.length === 1 ? "" : "s"}
              </AppText>
            </View>
            <AppText variant="price">{formatCurrency(item.totalAmount)}</AppText>
          </View>
        </Pressable>
      )}
    />
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.image,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.lg,
    gap: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: space.sm,
  },
});
