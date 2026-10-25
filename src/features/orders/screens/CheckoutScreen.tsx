import { useAuth } from "@/features/auth/context/AuthContext";
import { useCart } from "@/features/cart/context/CartContext";
import { LoadingOverlay } from "@/shared/components/LoadingOverlay";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { colors, radius, space } from "@/shared/theme";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { formatCurrency } from "@/shared/utils/format";
import { apiErrorMessage } from "@/shared/utils/apiError";
import {
  MAX_ADDRESS,
  MAX_CITY,
  MAX_EMAIL,
  MAX_FULL_NAME,
  MAX_NOTES,
  MAX_PHONE,
} from "@/shared/constants/limits";
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
  const { user } = useAuth();

  // Seeded straight from the session rather than copied in an effect, which would be a
  // cascading render. One effect, not the two identical ones that used to be here.
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState("");
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

  // Prefill is best-effort: a failure just leaves the fields empty.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      Alert.alert("Checkout failed", apiErrorMessage(err));
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
        <AppText variant="heading" style={styles.section}>
          Delivery details
        </AppText>
        <Input
          label="Full name"
          icon="user"
          placeholder="Who receives the order"
          value={fullName}
          onChangeText={setFullName}
          maxLength={MAX_FULL_NAME}
        />
        {isGuest && (
          <Input
            label="Email"
            icon="mail"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            maxLength={MAX_EMAIL}
          />
        )}
        <Input
          label="Phone"
          icon="phone"
          placeholder="+961 …"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={MAX_PHONE}
        />
        <Input
          label="City / area"
          icon="map-pin"
          placeholder="Akkar, Beirut …"
          value={city}
          onChangeText={setCity}
          maxLength={MAX_CITY}
        />
        <Input
          label="Address"
          icon="home"
          placeholder="Street and building"
          value={addressLine}
          onChangeText={setAddressLine}
          maxLength={MAX_ADDRESS}
        />
        <Input
          label="Delivery notes (optional)"
          icon="edit-2"
          placeholder="Landmark, floor, anything useful"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ height: 66, paddingTop: 12 }}
          maxLength={MAX_NOTES}
        />
        {!isGuest && (
          <Pressable
            style={styles.checkboxRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: saveAsDefault }}
            onPress={() => setSaveAsDefault((v) => !v)}
          >
            <View
              style={[styles.checkbox, saveAsDefault && styles.checkboxChecked]}
            />
            <AppText variant="small" color={colors.muted}>
              Save this info for next time
            </AppText>
          </Pressable>
        )}

        <AppText variant="heading" style={styles.section}>
          Shipping method
        </AppText>
        {SHIPPING_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.optionCard}
            onPress={() => setShippingMethod(opt.value)}
          >
            <View style={styles.optionRow}>
              <View
                style={[
                  styles.radio,
                  shippingMethod === opt.value && styles.radioActive,
                ]}
              />
              <AppText style={{ flex: 1 }}>{opt.label}</AppText>
              <AppText variant="heading">{formatCurrency(opt.cost)}</AppText>
            </View>
          </Pressable>
        ))}

        <AppText variant="heading" style={styles.section}>
          Payment method
        </AppText>
        {PAYMENT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            style={styles.optionCard}
            onPress={() => setPaymentMethod(opt.value)}
          >
            <View style={styles.optionRow}>
              <View
                style={[
                  styles.radio,
                  paymentMethod === opt.value && styles.radioActive,
                ]}
              />
              <AppText style={{ flex: 1 }}>{opt.label}</AppText>
            </View>
            {paymentMethod === opt.value && (
              <AppText
                variant="small"
                color={colors.muted}
                style={{ paddingLeft: 28, paddingTop: 4 }}
              >
                {opt.note}
              </AppText>
            )}
          </Pressable>
        ))}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <AppText variant="small" color={colors.muted}>
              Items
            </AppText>
            <AppText variant="small">{formatCurrency(itemsTotal)}</AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText variant="small" color={colors.muted}>
              Shipping
            </AppText>
            <AppText variant="small">{formatCurrency(shippingCost)}</AppText>
          </View>
          <View style={styles.summaryTotal}>
            <AppText variant="heading">Total</AppText>
            <AppText variant="price">{formatCurrency(total)}</AppText>
          </View>
        </View>

        <Button
          label={placing ? "Placing order..." : "Place order"}
          loading={placing}
          onPress={handlePlaceOrder}
          style={{ marginTop: space.lg }}
        />
      </ScrollView>
      <LoadingOverlay visible={placing} message="Placing your order..." />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: space.lg,
    paddingBottom: space.xxl,
    gap: space.xs,
  },
  section: { marginTop: space.lg, marginBottom: space.sm },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: space.sm,
    gap: space.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 5,
  },
  checkboxChecked: {
    backgroundColor: colors.sea,
    borderColor: colors.sea,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    marginBottom: space.sm,
  },
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
    borderColor: colors.line,
  },
  radioActive: { borderColor: colors.sea, backgroundColor: colors.sea },
  summary: {
    marginTop: space.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.image,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: space.lg,
    gap: 6,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    marginTop: space.xs,
    paddingTop: space.sm,
  },
});
