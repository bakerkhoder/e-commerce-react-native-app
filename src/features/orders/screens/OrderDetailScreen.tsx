import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { AppText } from "@/shared/components/AppText";
import { EmptyState } from "@/shared/components/EmptyState";
import { colors, radius, space } from "@/shared/theme";
import { useTranslation } from "@/i18n";
import { ordersApi } from "../api/ordersApi";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import { Order } from "../types";

export function OrderDetailScreen({ orderId }: { orderId: number }) {
  const [order, setOrder] = useState<Order | null>(null);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersApi
      .getOrder(orderId)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.sea} />
      </View>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon="alert-circle"
        title={t("orders.notFoundTitle")}
        message={t("orders.notFoundMessage")}
      />
    );
  }

  const itemsTotal = order.items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0,
  );
  const address = order.shippingAddress;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={s.card}>
        <View style={s.rowBetween}>
          <AppText variant="title">Order #{order.id}</AppText>
          <OrderStatusBadge status={order.status} />
        </View>
        <AppText variant="small" color={colors.muted}>
          Placed {formatDate(order.createdAt)}
        </AppText>
      </View>

      <AppText variant="heading" style={s.section}>
        Items
      </AppText>
      <View style={s.card}>
        {order.items.map((item, idx) => (
          <View key={item.productId}>
            {idx > 0 && <View style={s.divider} />}
            <View style={s.itemRow}>
              <View style={{ flex: 1 }}>
                <AppText variant="heading">{item.productName}</AppText>
                <AppText variant="small" color={colors.muted}>
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </AppText>
              </View>
              <AppText variant="price">
                {formatCurrency(item.unitPrice * item.quantity)}
              </AppText>
            </View>
          </View>
        ))}

        <View style={s.divider} />
        <View style={s.totalLine}>
          <AppText variant="small" color={colors.muted}>
            Items
          </AppText>
          <AppText variant="small">{formatCurrency(itemsTotal)}</AppText>
        </View>
        <View style={s.totalLine}>
          <AppText variant="small" color={colors.muted}>
            Shipping
          </AppText>
          <AppText variant="small">
            {formatCurrency(order.shippingCost)}
          </AppText>
        </View>
        <View style={[s.divider, { marginTop: space.sm }]} />
        <View style={s.totalLine}>
          <AppText variant="heading">{t("orders.total")}</AppText>
          <AppText variant="price">{formatCurrency(order.totalAmount)}</AppText>
        </View>
      </View>

      {address && (
        <>
          <AppText variant="heading" style={s.section}>
                        {t("orders.deliveringTo")}
          </AppText>
          <View style={s.card}>
            <View style={s.addrRow}>
              <Feather name="user" size={16} color={colors.muted} />
              <AppText variant="small">{address.fullName}</AppText>
            </View>
            <View style={s.addrRow}>
              <Feather name="phone" size={16} color={colors.muted} />
              <AppText variant="small">{address.phone}</AppText>
            </View>
            <View style={s.addrRow}>
              <Feather name="map-pin" size={16} color={colors.muted} />
              <AppText variant="small" style={{ flex: 1 }}>
                {[address.addressLine, address.city]
                  .filter(Boolean)
                  .join(", ")}
              </AppText>
            </View>
            {!!address.notes && (
              <View style={s.addrRow}>
                <Feather name="edit-2" size={16} color={colors.muted} />
                <AppText variant="small" color={colors.muted} style={{ flex: 1 }}>
                  {address.notes}
                </AppText>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  wrap: { padding: space.lg, paddingBottom: space.xxl, gap: space.xs },
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
  section: { marginTop: space.lg, marginBottom: space.xs },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: space.md,
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
  },
  addrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.sm,
    paddingVertical: 4,
  },
});
