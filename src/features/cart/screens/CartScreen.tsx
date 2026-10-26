import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../context/CartContext";
import { CartItemRow } from "../components/CartItemRow";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { colors, radius, space } from "@/shared/theme";
import { useTranslation } from "@/i18n";
import { formatCurrency } from "@/shared/utils/format";

export function CartScreen() {
  const { items, total, isGuest, updateQuantity } = useCart();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { run: change } = useAsyncAction(updateQuantity, {
    errorTitleKey: "cart.updateFailed",
  });
  const count = items.reduce((n, i) => n + i.quantity, 0);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="shopping-bag"
        title={t("cart.emptyTitle")}
        message={t("cart.emptyMessage")}
        action={{
          label: t("cart.browseShop"),
          onPress: () => router.push("/(tabs)"),
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.productId)}
        contentContainerStyle={{ padding: space.lg }}
        ItemSeparatorComponent={() => <View style={s.sep} />}
        ListHeaderComponent={
          isGuest ? (
            <View style={s.guest}>
              <AppText variant="small" style={{ flex: 1 }}>
                                {t("cart.guestBanner")}
              </AppText>
              <Pressable onPress={() => router.push("/auth/login")}>
                <AppText variant="button" color={colors.sea}>
                                    {t("cart.login")}
                </AppText>
              </Pressable>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <CartItemRow item={item} onChangeQuantity={change} />
        )}
      />
      <View
        style={[
          s.bar,
          { paddingBottom: Math.max(insets.bottom, space.lg) },
        ]}
      >
        <View>
          <AppText variant="small" color={colors.muted}>
            {count === 1
              ? t("cart.itemOne")
              : t("cart.itemMany", { count })}
          </AppText>
          <AppText variant="title">{formatCurrency(total)}</AppText>
        </View>
        <Button
          label={t("cart.checkout")}
          style={{ flex: 1, marginStart: space.lg }}
          onPress={() => router.push("/checkout")}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  guest: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.lemonSoft,
    borderRadius: radius.input,
    padding: space.md,
    marginBottom: space.sm,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    padding: space.lg,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
