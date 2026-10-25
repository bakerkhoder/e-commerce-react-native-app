import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { colors, radius, space } from "@/shared/theme";
import { Product } from "../../catalog/types";
import { adminApi } from "../api/adminApi";

export function PendingApprovalsScreen() {
  const [products, setProducts] = useState<Product[]>([]);

  useFocusEffect(
    useCallback(() => {
      adminApi.getPending().then(setProducts);
    }, []),
  );

  const { run: handleDecision, pending } = useAsyncAction(
    async (id: number, approve: boolean) => {
      await (approve ? adminApi.approve(id) : adminApi.reject(id));
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    { errorTitle: "Action failed" },
  );

  if (products.length === 0) {
    return (
      <EmptyState
        icon="check-square"
        title="Nothing waiting"
        message="New seller listings land here for you to approve or reject."
      />
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id.toString()}
      contentContainerStyle={{ padding: space.lg, gap: space.md }}
      renderItem={({ item }) => (
        <View style={s.card}>
          <AppText variant="heading">{item.name}</AppText>
          <AppText variant="small" color={colors.muted}>
            ${item.price.toFixed(2)}, seller #{item.sellerId}
          </AppText>
          <View style={s.row}>
            <Button
              label="Approve"
              icon="check"
              loading={pending}
              onPress={() => handleDecision(item.id, true)}
              style={{ flex: 1 }}
            />
            <Button
              label="Reject"
              variant="danger"
              disabled={pending}
              onPress={() => handleDecision(item.id, false)}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      )}
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
    gap: space.sm,
  },
  row: { flexDirection: "row", gap: space.md, marginTop: space.xs },
});
