import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useAuth } from "../../auth/context/AuthContext";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ProductImage } from "@/shared/components/ProductImage";
import { formatCurrency } from "@/shared/utils/format";
import { colors, radius, space } from "@/shared/theme";
import { catalogApi } from "../../catalog/api/catalogApi";
import { Product } from "../../catalog/types";
import { adminApi } from "../api/adminApi";

export function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      const fetch =
        user?.role === "SELLER"
          ? adminApi.getMyProducts()
          : catalogApi.getProducts();
      fetch.then(setProducts).catch(() => setProducts([]));
    }, [user]),
  );

  const { run: performDelete, pending: deleting } = useAsyncAction(
    async (id: number) => {
      await adminApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    { errorTitle: "Delete failed" },
  );

  function handleDelete(id: number) {
    Alert.alert("Delete product?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => performDelete(id),
      },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={s.headerBar}>
        <Button
          label="New product"
          icon="plus"
          onPress={() => router.push("/manage/product-form")}
          style={{ flex: 1 }}
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingBottom: space.xxl,
          gap: space.sm,
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <EmptyState
            icon="box"
            title="No products yet"
            message="Add your first product and it will show up in the shop once approved."
          />
        }
        renderItem={({ item }) => (
          <View style={s.row}>
            <ProductImage url={item.thumbnailUrl} size={56} />
            <View style={{ flex: 1 }}>
              <AppText variant="heading" numberOfLines={1}>
                {item.name}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {formatCurrency(item.price)}
              </AppText>
              <AppText variant="small" color={colors.muted}>
                {item.stockQuantity} in stock
              </AppText>
            </View>
            <Pressable
              hitSlop={10}
              accessibilityLabel={`Edit ${item.name}`}
              onPress={() => router.push(`/manage/product-form?id=${item.id}`)}
            >
              <Feather name="edit-2" size={18} color={colors.sea} />
            </Pressable>
            <Pressable
              hitSlop={10}
              accessibilityLabel={`Delete ${item.name}`}
              onPress={() => handleDelete(item.id)}
              disabled={deleting}
            >
              <Feather
                name="trash-2"
                size={18}
                color={colors.tomato}
                style={deleting && { opacity: 0.5 }}
              />
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  headerBar: { flexDirection: "row", padding: space.lg, paddingBottom: space.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.image,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.md,
  },
});
