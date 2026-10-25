import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Linking, StyleSheet, View } from "react-native";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { colors, radius, space } from "@/shared/theme";
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

const humanize = (v: string) => v.replace(/_/g, " ").toLowerCase();

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

  const { run: advanceStatus, pending: advancing } = useAsyncAction(
    async (order: Order) => {
      const next = NEXT_STATUS[order.status];
      if (!next) return;
      const updated = await ordersApi.updateStatus(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    },
    { errorTitle: "Status update failed" },
  );

  const { run: performCancel, pending: cancelling } = useAsyncAction(
    async (order: Order) => {
      const updated = await ordersApi.updateStatus(order.id, "CANCELLED");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    },
    { errorTitle: "Cancellation failed" },
  );

  function cancelOrder(order: Order) {
    Alert.alert("Cancel order?", `Order #${order.id} will be marked cancelled.`, [
      { text: "No", style: "cancel" },
      {
        text: "Yes, cancel",
        style: "destructive",
        onPress: () => performCancel(order),
      },
    ]);
  }

  const busy = advancing || cancelling;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="list"
        title="No orders yet"
        message="Orders placed in the shop will appear here for you to fulfil."
      />
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id.toString()}
      contentContainerStyle={{ padding: space.lg, gap: space.md }}
      renderItem={({ item }) => {
        const next = NEXT_STATUS[item.status];
        return (
          <View style={s.card}>
            <View style={s.rowBetween}>
              <AppText variant="heading">Order #{item.id}</AppText>
              <OrderStatusBadge status={item.status} />
            </View>

            <AppText variant="small" color={colors.muted}>
              {formatDate(item.createdAt)}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              {humanize(item.paymentMethod)}
            </AppText>
            <AppText variant="small">{item.shippingAddress.fullName}</AppText>
            <AppText variant="small" color={colors.muted}>
              {item.shippingAddress.phone}
            </AppText>
            <AppText variant="small" color={colors.muted}>
              {item.shippingAddress.addressLine}, {item.shippingAddress.city}
            </AppText>

            <AppText variant="price" style={{ marginTop: space.sm }}>
              {formatCurrency(item.totalAmount)}
            </AppText>

            <View style={s.actions}>
              <Button
                label="WhatsApp"
                icon="message-circle"
                variant="secondary"
                onPress={() => Linking.openURL(buildWhatsAppLink(item))}
                style={{ flexGrow: 1 }}
              />
              {next && (
                <Button
                  label={`Mark ${humanize(next)}`}
                  loading={advancing}
                  onPress={() => advanceStatus(item)}
                  style={{ flexGrow: 1 }}
                />
              )}
              {item.status !== "CANCELLED" && item.status !== "DELIVERED" && (
                <Button
                  label="Cancel"
                  variant="danger"
                  disabled={busy}
                  onPress={() => cancelOrder(item)}
                  style={{ flexGrow: 1 }}
                />
              )}
            </View>
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.image,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.lg,
    gap: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: space.xs,
  },
  actions: {
    flexDirection: "row",
    gap: space.sm,
    marginTop: space.md,
    flexWrap: "wrap",
  },
});
