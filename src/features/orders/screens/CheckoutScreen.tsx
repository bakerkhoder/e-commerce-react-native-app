import { useAuth } from "@/features/auth/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { formatCurrency } from "../../../shared/utils/format";
import { profileApi } from "../../profile/api/profileApi";
import { ordersApi } from "../api/ordersApi";
import { PaymentMethodType, ShippingMethodType } from "../types";

const SHIPPING_OPTIONS: {
  value: ShippingMethodType;
  label: string;
  cost: number;
}[] = [
  { value: "INSIDE_BEIRUT", label: "Inside Beirut", cost: 5.0 },
  { value: "OUTSIDE_BEIRUT", label: "Outside Beirut", cost: 7.0 },
];

const PAYMENT_OPTIONS: {
  value: PaymentMethodType;
  label: string;
  note: string;
}[] = [
  {
    value: "CASH_ON_DELIVERY",
    label: "Cash on Delivery",
    note: "Pay in cash when your order arrives.",
  },
  {
    value: "WHISH_MONEY",
    label: "Whish Money",
    note: "We'll contact you with transfer details to confirm your payment.",
  },
];

export function CheckoutScreen() {
  const { items, total: itemsTotal, isGuest, clear, refresh } = useCart();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodType>("INSIDE_BEIRUT");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodType>("CASH_ON_DELIVERY");
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  const [placing, setPlacing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
    refresh();
    profileApi
      .getMe()
      .then((me) => {
        if (me.defaultPhone) setPhone(me.defaultPhone);
        if (me.defaultCity) setCity(me.defaultCity);
        if (me.defaultAddressLine) setAddressLine(me.defaultAddressLine);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    refresh();
    profileApi
      .getMe()
      .then((me) => {
        if (me.defaultPhone) setPhone(me.defaultPhone);
        if (me.defaultCity) setCity(me.defaultCity);
        if (me.defaultAddressLine) setAddressLine(me.defaultAddressLine);
      })
      .catch(() => {});
  }, []);

  const shippingCost = SHIPPING_OPTIONS.find(
    (s) => s.value === shippingMethod,
  )!.cost;
  const total = itemsTotal + shippingCost;

  async function handlePlaceOrder() {
    if (placing) return;

    if (
      !fullName.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !addressLine.trim()
    ) {
      Alert.alert(
        "Missing info",
        "Please fill in all required delivery fields.",
      );
      return;
    }
    if (isGuest && !email.trim()) {
      Alert.alert(
        "Missing info",
        "Please enter your email so we can contact you about your order.",
      );
      return;
    }
    setPlacing(true);
    try {
      const order = isGuest
        ? await ordersApi.guestCheckout({
            email: email.trim(),
            fullName: fullName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            addressLine: addressLine.trim(),
            notes: notes.trim() || undefined,
            shippingMethod,
            paymentMethod,
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          })
        : await ordersApi.checkout({
            fullName: fullName.trim(),
            phone: phone.trim(),
            city: city.trim(),
            addressLine: addressLine.trim(),
            notes: notes.trim() || undefined,
            shippingMethod,
            paymentMethod,
            saveAsDefault,
          });
      await clear();
      Alert.alert(
        "Order placed!",
        `Order #${order.id} — total ${formatCurrency(order.totalAmount)}`,
        [
          {
            text: "OK",
            onPress: () => router.replace(isGuest ? "/(tabs)" : "/orders"),
          },
        ],
      );
    } catch (err: any) {
      Alert.alert(
        "Checkout failed",
        err.response?.data?.message ?? "Please try again.",
      );
    } finally {
      setPlacing(false);
    }
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.section}>Delivery details</Text>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          value={fullName}
          onChangeText={setFullName}
        />
        {isGuest && (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Phone (include +961)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="City / Area (e.g. Akkar, Beirut)"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={addressLine}
          onChangeText={setAddressLine}
        />
        <TextInput
          style={[styles.input, { height: 70 }]}
          placeholder="Delivery notes (optional)"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        {!isGuest && (
          <Pressable
            style={styles.checkboxRow}
            onPress={() => setSaveAsDefault((v) => !v)}
          >
            <View
              style={[styles.checkbox, saveAsDefault && styles.checkboxChecked]}
            />
            <Text style={styles.checkboxLabel}>
              Save this info for next time
            </Text>
          </Pressable>
        )}

        <Text style={styles.section}>Shipping method</Text>
        {SHIPPING_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.optionRow}
            onPress={() => setShippingMethod(opt.value)}
          >
            <View
              style={[
                styles.radio,
                shippingMethod === opt.value && styles.radioActive,
              ]}
            />
            <Text style={styles.optionLabel}>{opt.label}</Text>
            <Text style={styles.optionCost}>{formatCurrency(opt.cost)}</Text>
          </Pressable>
        ))}

        <Text style={styles.section}>Payment method</Text>
        {PAYMENT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.paymentCard}
            onPress={() => setPaymentMethod(opt.value)}
          >
            <View style={styles.optionRow}>
              <View
                style={[
                  styles.radio,
                  paymentMethod === opt.value && styles.radioActive,
                ]}
              />
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </View>
            {paymentMethod === opt.value && (
              <Text style={styles.paymentNote}>{opt.note}</Text>
            )}
          </Pressable>
        ))}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Items</Text>
            <Text>{formatCurrency(itemsTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Shipping</Text>
            <Text>{formatCurrency(shippingCost)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalLabel}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <Pressable
          style={styles.placeButton}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          <Text style={styles.placeButtonText}>
            {placing ? "Placing order..." : "Place Order"}
          </Text>
        </Pressable>
      </ScrollView>
      <LoadingOverlay visible={placing} message="Placing your order..." />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 48 },
  section: { fontSize: 16, fontWeight: "700", marginTop: 20, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 15,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
  },
  checkboxChecked: { backgroundColor: "#111", borderColor: "#111" },
  checkboxLabel: { fontSize: 13, color: "#555" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#ccc",
  },
  radioActive: { borderColor: "#111", backgroundColor: "#111" },
  optionLabel: { flex: 1, fontSize: 15 },
  optionCost: { fontSize: 14, fontWeight: "600" },
  paymentCard: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  paymentNote: {
    fontSize: 12,
    color: "#777",
    paddingBottom: 10,
    paddingLeft: 28,
  },
  summary: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
    gap: 6,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: 17, fontWeight: "700" },
  placeButton: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 20,
  },
  placeButtonText: { color: "#fff", fontWeight: "600" },
});
