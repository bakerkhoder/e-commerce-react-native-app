import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { catalogApi } from "../../features/catalog/api/catalogApi";
import { analyticsApi } from "../../features/dashboard/api/dashboardApi";
import { useCart } from "../../features/cart/context/CartContext";
import { ProductGallery } from "../../features/catalog/components/ProductGallery";
import { Product } from "../../features/catalog/types";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Price } from "@/shared/components/Price";
import { Stepper } from "@/shared/components/Stepper";
import { EmptyState } from "@/shared/components/EmptyState";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { aisle, colors, space } from "@/shared/theme";

const humanize = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const show = (v: unknown) =>
  typeof v === "boolean" ? (v ? "Yes" : "No") : String(v);

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [failed, setFailed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    catalogApi
      .getProduct(Number(id))
      .then(setProduct)
      .catch(() => setFailed(true));
    // Fire-and-forget view ping. This is the customer-facing page, so a seller editing
    // the product elsewhere never counts as a view.
    analyticsApi.recordView(Number(id));
  }, [id]);

  const { run: handleAdd, pending } = useAsyncAction(
    async () => {
      if (!product) return;
      await addItem(product, quantity);
      setAdded(true);
    },
    { errorTitle: "Could not add to cart" },
  );

  if (failed) {
    return (
      <EmptyState
        icon="alert-circle"
        title="Product not found"
        message="It may have been removed. Head back to the shop to keep browsing."
        action={{
          label: "Back to the shop",
          onPress: () => router.replace("/(tabs)"),
        }}
      />
    );
  }

  if (!product) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={colors.sea} />
      </View>
    );
  }

  const tone = aisle(product.categoryId);
  const maxQty = Math.min(product.stockQuantity, 99);
  const soldOut = product.stockQuantity === 0;
  const stockText = soldOut
    ? "Sold out"
    : product.stockQuantity <= 5
      ? `Only ${product.stockQuantity} left`
      : "In stock";
  const stockColor =
    soldOut || product.stockQuantity <= 5 ? colors.tomato : colors.leaf;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={s.back}
              accessibilityLabel="Go back"
            >
              <Feather name="arrow-left" size={20} color={colors.ink} />
            </Pressable>
          ),
        }}
      />
      {/* On iOS 26+ the stack header is transparent by default, so content would sit
          under it. This inset behaviour keeps the gallery clear of the header. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        <ProductGallery images={product.images} tint={tone.tint} />
        <View style={s.body}>
          <View style={[s.aisleChip, { backgroundColor: tone.tint }]}>
            <AppText variant="small" color={tone.tone}>
              {product.categoryName}
            </AppText>
          </View>
          <AppText variant="display">{product.name}</AppText>
          <View style={s.priceRow}>
            <Price value={product.price} unit={product.unit} />
            <AppText variant="small" color={stockColor}>
              {stockText}
            </AppText>
          </View>
          {!!product.description && (
            <AppText color={colors.muted}>{product.description}</AppText>
          )}
          {Object.entries(product.attributes ?? {}).map(([k, v]) => (
            <View key={k} style={s.attr}>
              <AppText variant="small" color={colors.muted}>
                {humanize(k)}
              </AppText>
              <AppText variant="small">{show(v)}</AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[s.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Stepper
          value={quantity}
          max={Math.max(maxQty, 1)}
          onChange={(v) => {
            setAdded(false);
            setQuantity(v);
          }}
        />
        <Button
          style={{ flex: 1 }}
          loading={pending}
          disabled={soldOut}
          variant={added ? "secondary" : "primary"}
          icon={added ? "check" : "shopping-bag"}
          label={soldOut ? "Sold out" : added ? "Go to cart" : "Add to cart"}
          onPress={() => (added ? router.push("/(tabs)/cart") : handleAdd())}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  body: { padding: space.lg, gap: space.md },
  aisleChip: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  attr: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingTop: 12,
    paddingHorizontal: space.lg,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
});
