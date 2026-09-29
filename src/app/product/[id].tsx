import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../features/auth/context/AuthContext";
import { cartApi } from "../../features/cart/api/cartApi";
import { catalogApi } from "../../features/catalog/api/catalogApi";
import { Product } from "../../features/catalog/types";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    catalogApi
      .getProduct(Number(id))
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [id]);

  async function handleAddToCart() {
    if (!user) {
      Alert.alert(
        "Log in required",
        "Please log in to add items to your cart.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => router.push("/auth/login") },
        ],
      );
      return;
    }
    setAdding(true);
    try {
      await cartApi.addItem(Number(id), 1);
      Alert.alert("Added to cart", `${product?.name} was added to your cart.`);
    } catch (err: any) {
      Alert.alert(
        "Could not add item",
        err.response?.data?.message ?? "Please try again.",
      );
    } finally {
      setAdding(false);
    }
  }

  if (!product)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  return (
    <View style={styles.container}>
      <ProductGallery images={product.images} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.category}>{product.categoryName}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>
        ${product.price.toFixed(2)} / {product.unit}
      </Text>
      <Text style={styles.stock}>{product.stockQuantity} in stock</Text>
      <Pressable
        style={styles.button}
        onPress={handleAddToCart}
        disabled={adding}
      >
        <Text style={styles.buttonText}>
          {adding ? "Adding..." : "Add to Cart"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  name: { fontSize: 22, fontWeight: "700" },
  category: { fontSize: 14, color: "#888", marginTop: 4 },
  description: { fontSize: 15, marginTop: 12, lineHeight: 21 },
  price: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  stock: { fontSize: 13, color: "#888", marginTop: 4 },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
