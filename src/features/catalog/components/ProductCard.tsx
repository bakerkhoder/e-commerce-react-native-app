import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}` as never)}
    >
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>{product.categoryName}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "600" },
  category: { fontSize: 13, color: "#888", marginTop: 2 },
  price: { fontSize: 15, marginTop: 6, fontWeight: "500" },
});
