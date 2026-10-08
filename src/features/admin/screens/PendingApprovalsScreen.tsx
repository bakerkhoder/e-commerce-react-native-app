import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
      const action = approve ? adminApi.approve(id) : adminApi.reject(id);
      await action;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    },
    {
      errorTitle: "Action failed",
      fallbackMessage: "Could not update product.",
    },
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        <Text style={styles.empty}>No pending products.</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            ${item.price.toFixed(2)} · seller #{item.sellerId}
          </Text>
          <View style={styles.row}>
            <Pressable
              style={[
                styles.button,
                styles.approve,
                pending && { opacity: 0.6 },
              ]}
              onPress={() => handleDecision(item.id, true)}
              disabled={pending}
            >
              <Text style={styles.buttonText}>Approve</Text>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.reject,
                pending && { opacity: 0.6 },
              ]}
              onPress={() => handleDecision(item.id, false)}
              disabled={pending}
            >
              <Text style={styles.buttonText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: "#888", marginTop: 40 },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: "600" },
  meta: { fontSize: 13, color: "#777" },
  row: { flexDirection: "row", gap: 10, marginTop: 4 },
  button: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  approve: { backgroundColor: "#2f855a" },
  reject: { backgroundColor: "#c0392b" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
