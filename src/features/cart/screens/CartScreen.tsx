import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../auth/context/AuthContext";
import { CartItemRow } from "../components/CartItemRow";
import { useCart } from "../hooks/useCart";

export function CartScreen() {
  const { user } = useAuth();
  const { cart, loading, refresh, removeItem } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  // Refetch every time the Cart tab comes into focus, not just on first mount —
  // so items added from a product screen actually show up here without a manual reload
  useFocusEffect(
    useCallback(() => {
      if (user) refresh();
    }, [user]),
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Log in to view your cart.</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>
      </View>
    );
  }

  if (loading && !cart) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Your cart is empty.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <CartItemRow item={item} onRemove={removeItem} />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${cart.total.toFixed(2)}</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.buttonText}>Proceed to Checkout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: "#eee" },
  total: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
