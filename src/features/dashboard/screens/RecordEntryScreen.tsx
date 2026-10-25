import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../auth/context/AuthContext";
import { adminApi } from "../../admin/api/adminApi";
import { catalogApi } from "../../catalog/api/catalogApi";
import { Product } from "../../catalog/types";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { colors, space } from "@/shared/theme";
import { apiErrorMessage } from "@/shared/utils/apiError";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { formatCurrency } from "@/shared/utils/format";
import { dashboardApi } from "../api/dashboardApi";
import { LedgerType } from "../types";

function today(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function RecordEntryScreen({ type }: { type: LedgerType }) {
  const isPurchase = type === "PURCHASE";
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState("");
  const [addToStock, setAddToStock] = useState(true);

  useEffect(() => {
    const load = user?.role === "ADMIN" ? catalogApi.getProducts() : adminApi.getMyProducts();
    load
      .then(setProducts)
      .catch((err) =>
        Alert.alert("Could not load products", apiErrorMessage(err)),
      );
  }, [user]);

  const matches = products
    .filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))
    .slice(0, 6);
  const total = (Number(quantity) || 0) * (Number(amount) || 0);

  const { run: submit, pending } = useAsyncAction(
    async () => {
      if (!product) {
        Alert.alert("Choose a product", "Pick a product before saving.");
        return;
      }
      const qty = Number(quantity);
      const amt = Number(amount);
      if (!Number.isInteger(qty) || qty < 1) {
        Alert.alert("Check the quantity", "Quantity must be a whole number of at least 1.");
        return;
      }
      if (!(amt > 0)) {
        Alert.alert(
          "Check the amount",
          isPurchase ? "Enter the unit cost." : "Enter the unit price.",
        );
        return;
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        Alert.alert("Check the date", "Use the format YYYY-MM-DD.");
        return;
      }
      await dashboardApi.record({
        type,
        productId: product.id,
        quantity: qty,
        unitAmount: amt,
        entryDate: date,
        notes: notes.trim() || undefined,
        addToStock: isPurchase ? addToStock : false,
      });
      Alert.alert(
        "Saved",
        isPurchase ? "Purchase recorded." : "Sale recorded.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    },
    { errorTitle: "Could not save" },
  );

  return (
    <ScrollView
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
    >
      <AppText variant="title">
        {isPurchase ? "Record a purchase" : "Record a sale"}
      </AppText>
      <AppText variant="small" style={s.subheading}>
        {isPurchase
          ? "What you bought, and what it cost you per unit."
          : "A sale you made outside the app, so it counts in your revenue."}
      </AppText>

      {product ? (
        <Pressable style={s.selected} onPress={() => setProduct(null)}>
          <AppText variant="heading">{product.name} (tap to change)</AppText>
        </Pressable>
      ) : (
        <>
          <Input
            label="Product"
            icon="search"
            placeholder="Search your products"
            value={filter}
            onChangeText={setFilter}
            autoCapitalize="none"
          />
          {matches.map((p) => (
            <Pressable
              key={p.id}
              style={s.option}
              onPress={() => {
                setProduct(p);
                if (!isPurchase) setAmount(String(p.price));
              }}
            >
              <AppText>{p.name}</AppText>
              <AppText variant="small" style={s.optionMeta}>
                {p.stockQuantity} in stock · {formatCurrency(p.price)}
              </AppText>
            </Pressable>
          ))}
          {products.length === 0 && (
            <AppText variant="small" style={s.hint}>
              No products available to record against yet.
            </AppText>
          )}
        </>
      )}

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Input
            label="Quantity"
            icon="hash"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label={isPurchase ? "Unit cost" : "Unit price"}
            icon="tag"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Input
        label="Date (YYYY-MM-DD)"
        icon="calendar"
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
      />

      <Input
        label="Notes (optional)"
        icon="edit-2"
        value={notes}
        onChangeText={setNotes}
        maxLength={300}
      />

      {isPurchase && (
        <Pressable
          style={s.checkRow}
          onPress={() => setAddToStock((v) => !v)}
        >
          <View style={[s.box, addToStock && s.boxChecked]} />
          <AppText variant="small" style={s.hint}>
            Add these units to stock (also updates the product&apos;s average cost)
          </AppText>
        </Pressable>
      )}
      {!isPurchase && (
        <AppText variant="small" style={s.hint}>
          Recording a sale reduces the product&apos;s stock.
        </AppText>
      )}

      <AppText variant="heading" style={s.total}>
        Total: {formatCurrency(total)}
      </AppText>
      <Button
        label={pending ? "Saving..." : isPurchase ? "Save purchase" : "Save sale"}
        loading={pending}
        onPress={() => submit()}
        style={{ marginTop: space.lg }}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: 48 },
  subheading: { color: colors.muted, marginTop: space.xs, marginBottom: space.sm },
  option: { padding: space.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  optionMeta: { color: colors.muted, marginTop: 2 },
  selected: { backgroundColor: colors.seaSoft, borderRadius: 8, padding: space.md },
  row: { flexDirection: "row", gap: 10 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: space.sm, marginTop: 14 },
  box: { width: 18, height: 18, borderWidth: 1, borderColor: colors.muted, borderRadius: 4 },
  boxChecked: { backgroundColor: colors.ink, borderColor: colors.ink },
  hint: { color: colors.muted, marginTop: space.sm, flex: 1 },
  total: { marginTop: space.lg },
});
