import { useCart } from "@/features/cart/context/CartContext";
import { ProductGallery } from "@/features/catalog/components/ProductGallery";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../features/auth/context/AuthContext";
import { catalogApi } from "../../features/catalog/api/catalogApi";
import { Product } from "../../features/catalog/types";

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  async function handleAddToCart() {
    if (!product) return;
    await addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }
  useEffect(() => {
    catalogApi
      .getProduct(Number(id))
      .then(setProduct)
      .catch(() => setProduct(null));
  }, [id]);

  // async function handleAddToCart() {
  //   if (!user) {
  //     Alert.alert(
  //       "Log in required",
  //       "Please log in to add items to your cart.",
  //       [
  //         { text: "Cancel", style: "cancel" },
  //         { text: "Log In", onPress: () => router.push("/auth/login") },
  //       ],
  //     );
  //     return;
  //   }
  //   setAdding(true);
  //   try {
  //     await cartApi.addItem(Number(id), 1);
  //     Alert.alert("Added to cart", `${product?.name} was added to your cart.`);
  //   } catch (err: any) {
  //     Alert.alert(
  //       "Could not add item",
  //       err.response?.data?.message ?? "Please try again.",
  //     );
  //   } finally {
  //     setAdding(false);
  //   }
  // }

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
      <View style={styles.qtyRow}>
        <Pressable
          style={styles.qtyBtn}
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </Pressable>
        <Text style={styles.qtyValue}>{quantity}</Text>
        <Pressable
          style={[
            styles.qtyBtn,
            quantity >= product.stockQuantity && styles.qtyBtnDisabled,
          ]}
          onPress={() =>
            quantity < product.stockQuantity && setQuantity((q) => q + 1)
          }
        >
          <Text style={styles.qtyBtnText}>+</Text>
        </Pressable>
        <Text style={styles.stockHint}>{product.stockQuantity} available</Text>
      </View>
      <Pressable
        style={[
          styles.button,
          product.stockQuantity === 0 && styles.buttonDisabled,
        ]}
        onPress={handleAddToCart}
        disabled={product.stockQuantity === 0}
      >
        <Text style={styles.buttonText}>
          {product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Text>
      </Pressable>
      {justAdded && (
        <Pressable onPress={() => router.push("/(tabs)/cart")}>
          <Text style={styles.addedText}>✓ Added to cart — View Cart</Text>
        </Pressable>
      )}
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
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnDisabled: { opacity: 0.3 },
  qtyBtnText: { fontSize: 18, fontWeight: "600" },
  qtyValue: { fontSize: 16, width: 24, textAlign: "center" },
  stockHint: { fontSize: 12, color: "#888", marginLeft: 8 },
  buttonDisabled: { backgroundColor: "#aaa" },
  addedText: {
    color: "#2f855a",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
  },
});
