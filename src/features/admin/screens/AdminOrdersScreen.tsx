import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, Linking, StyleSheet, View } from "react-native";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { colors, radius, space } from "@/shared/theme";
import { useTranslation } from "@/i18n";
import type { TranslationKey } from "@/i18n/locales/ar";
import { ordersApi } from "../../orders/api/ordersApi";
import { OrderStatusBadge, STATUS_LABEL_KEY } from "../../orders/components/OrderStatusBadge";
import { Order, OrderStatus } from "../../orders/types";

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  PENDING: "PAID",
  PAID: "SHIPPED",
  SHIPPED: "DELIVERED",
  DELIVERED: null,
  CANCELLED: null,
};

const humanize = (v: string) => v.replace(/_/g, " ").toLowerCase();

function buildWhatsAppLink(
  order: Order,
  t: (key: TranslationKey, params?: Record<string, string | number>) => string,
): string {
  const digits = order.shippingAddress.phone.replace(/[^\d]/g, "");
  const message = t("admin.whatsappMessage", {
    name: order.shippingAddress.fullName,
    id: order.id,
    total: formatCurrency(order.totalAmount),
    payment: t(
      order.paymentMethod === "WHISH_MONEY"
        ? "checkout.whish"
        : "checkout.cashOnDelivery",
    ),
  });
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { t } = useTranslation();

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
    { errorTitleKey: "admin.statusUpdateFailed" },
  );

  const { run: performCancel, pending: cancelling } = useAsyncAction(
    async (order: Order) => {
      const updated = await ordersApi.updateStatus(order.id, "CANCELLED");
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
    },
    { errorTitleKey: "admin.cancellationFailed" },
  );

  function cancelOrder(order: Order) {
    Alert.alert(t("admin.cancelOrderTitle"), t("admin.cancelOrderMessage", { id: order.id }), [
      { text: t("common.no"), style: "cancel" },
      {
        text: t("admin.cancelYes"),
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
        title={t("admin.adminOrdersTitle")}
        message={t("admin.adminOrdersMessage")}
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
                label={t("admin.whatsapp")}
                icon="message-circle"
                variant="secondary"
                onPress={() => Linking.openURL(buildWhatsAppLink(item, t))}
                style={{ flexGrow: 1 }}
              />
              {next && (
                <Button
                  label={t("admin.markAs", {
                    status: t(STATUS_LABEL_KEY[next]).toLowerCase(),
                  })}
                  loading={advancing}
                  onPress={() => advanceStatus(item)}
                  style={{ flexGrow: 1 }}
                />
              )}
              {item.status !== "CANCELLED" && item.status !== "DELIVERED" && (
                <Button
                  label={t("admin.cancel")}
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
