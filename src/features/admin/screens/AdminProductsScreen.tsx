import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { catalogApi } from "../../catalog/api/catalogApi";
import { Product } from "../../catalog/types";
import { adminApi } from "../api/adminApi";

export function AdminProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);

  useFocusEffect(
    useCallback(() => {
      catalogApi.getProducts().then(setProducts);
    }, []),
  );

  function handleDelete(id: number) {
    Alert.alert("Delete product?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await adminApi.deleteProduct(id);
          setProducts((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  }

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/admin/product-form")}
      >
        <Text style={styles.addButtonText}>+ New Product</Text>
      </Pressable>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                ${item.price.toFixed(2)} · {item.stockQuantity} in stock
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(`/admin/product-form?id=${item.id}`)}
            >
              <Text style={styles.edit}>Edit</Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#111",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 12,
  },
  name: { fontSize: 15, fontWeight: "600" },
  meta: { fontSize: 13, color: "#888" },
  edit: { color: "#2563eb", fontWeight: "600" },
  delete: { color: "#c0392b", fontWeight: "600" },
});
