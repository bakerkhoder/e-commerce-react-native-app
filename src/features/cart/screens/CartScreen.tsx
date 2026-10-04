import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { CartItemRow } from "../components/CartItemRow";
import { useCart } from "../context/CartContext";

export function CartScreen() {
  const { items, total, isGuest, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Your cart is empty.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isGuest && (
        <View style={styles.guestBanner}>
          <Text style={styles.guestText}>
            Shopping as a guest — log in to save your cart across devices.
          </Text>
        </View>
      )}
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={({ item }) => (
          <CartItemRow item={item} onChangeQuantity={updateQuantity} />
        )}
        contentContainerStyle={{ padding: 16 }}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
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
  },
  guestBanner: { backgroundColor: "#fff8e1", padding: 10 },
  guestText: { fontSize: 12, color: "#8a6d00", textAlign: "center" },
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
