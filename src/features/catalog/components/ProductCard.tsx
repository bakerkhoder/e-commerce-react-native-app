import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ProductImage } from "../../../shared/components/ProductImage";
import { Product } from "../types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <ProductImage url={product.thumbnailUrl} size={64} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.category}>{product.categoryName}</Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "600" },
  category: { fontSize: 13, color: "#888", marginTop: 2 },
  price: { fontSize: 15, marginTop: 6, fontWeight: "500" },
});
