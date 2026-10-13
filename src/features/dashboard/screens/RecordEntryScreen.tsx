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
import { router } from "expo-router";
import { useAuth } from "../../auth/context/AuthContext";
import { adminApi } from "../../admin/api/adminApi";
import { catalogApi } from "../../catalog/api/catalogApi";
import { Product } from "../../catalog/types";
import { apiErrorMessage } from "../../../shared/utils/apiError";
import { useAsyncAction } from "../../../shared/hooks/useAsyncAction";
import { formatCurrency } from "../../../shared/utils/format";
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
      <Text style={s.heading}>
        {isPurchase ? "Record a purchase" : "Record a sale"}
      </Text>
      <Text style={s.subheading}>
        {isPurchase
          ? "What you bought, and what it cost you per unit."
          : "A sale you made outside the app, so it counts in your revenue."}
      </Text>

      <Text style={s.label}>Product</Text>
      {product ? (
        <Pressable style={s.selected} onPress={() => setProduct(null)}>
          <Text style={s.selectedText}>{product.name} (tap to change)</Text>
        </Pressable>
      ) : (
        <>
          <TextInput
            style={s.input}
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
              <Text>{p.name}</Text>
              <Text style={s.optionMeta}>
                {p.stockQuantity} in stock · {formatCurrency(p.price)}
              </Text>
            </Pressable>
          ))}
          {products.length === 0 && (
            <Text style={s.hint}>
              No products available to record against yet.
            </Text>
          )}
        </>
      )}

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>Quantity</Text>
          <TextInput
            style={s.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.label}>{isPurchase ? "Unit cost" : "Unit price"}</Text>
          <TextInput
            style={s.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <Text style={s.label}>Date (YYYY-MM-DD)</Text>
      <TextInput
        style={s.input}
        value={date}
        onChangeText={setDate}
        autoCapitalize="none"
      />

      <Text style={s.label}>Notes (optional)</Text>
      <TextInput
        style={s.input}
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
          <Text style={s.hint}>
            Add these units to stock (also updates the product's average cost)
          </Text>
        </Pressable>
      )}
      {!isPurchase && (
        <Text style={s.hint}>
          Recording a sale reduces the product's stock.
        </Text>
      )}

      <Text style={s.total}>Total: {formatCurrency(total)}</Text>
      <Pressable style={s.button} onPress={() => submit()} disabled={pending}>
        <Text style={s.buttonText}>
          {pending ? "Saving..." : isPurchase ? "Save purchase" : "Save sale"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 20, fontWeight: "700" },
  subheading: { fontSize: 13, color: "#666", marginTop: 4, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: "600", color: "#444", marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  option: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
  optionMeta: { fontSize: 12, color: "#888", marginTop: 2 },
  selected: { backgroundColor: "#eef4ff", borderRadius: 8, padding: 12 },
  selectedText: { fontWeight: "600" },
  row: { flexDirection: "row", gap: 10 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  box: { width: 18, height: 18, borderWidth: 1, borderColor: "#999", borderRadius: 4 },
  boxChecked: { backgroundColor: "#111", borderColor: "#111" },
  hint: { fontSize: 12, color: "#777", marginTop: 8, flex: 1 },
  total: { fontSize: 16, fontWeight: "700", marginTop: 16 },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
