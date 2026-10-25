import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useCart } from "../context/CartContext";
import { CartItemRow } from "../components/CartItemRow";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { colors, radius, space } from "@/shared/theme";
import { formatCurrency } from "@/shared/utils/format";

export function CartScreen() {
  const { items, total, isGuest, updateQuantity } = useCart();
  const { run: change } = useAsyncAction(updateQuantity, {
    errorTitle: "Could not update your cart",
  });
  const count = items.reduce((n, i) => n + i.quantity, 0);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="shopping-bag"
        title="Your cart is empty"
        message="Add something from the shop and it will show up here."
        action={{
          label: "Browse the shop",
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
                Shopping as a guest. Log in to keep your cart on every device.
              </AppText>
              <Pressable onPress={() => router.push("/auth/login")}>
                <AppText variant="button" color={colors.sea}>
                  Log in
                </AppText>
              </Pressable>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <CartItemRow item={item} onChangeQuantity={change} />
        )}
      />
      <View style={s.bar}>
        <View>
          <AppText variant="small" color={colors.muted}>
            {count} {count === 1 ? "item" : "items"}, shipping added at checkout
          </AppText>
          <AppText variant="title">{formatCurrency(total)}</AppText>
        </View>
        <Button
          label="Go to checkout"
          style={{ flex: 1, marginLeft: space.lg }}
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
