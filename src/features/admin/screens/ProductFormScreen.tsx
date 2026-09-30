import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { IMAGE_BASE_URL } from "../../../api/client";
import { catalogApi } from "../../catalog/api/catalogApi";
import { Category } from "../../catalog/types";
import { adminApi } from "../api/adminApi";
interface AttrRow {
  key: string;
  value: string;
}

// Convert "true"/"false"/"24" typed as text into real booleans/numbers for the JSONB column
function parseAttrValue(v: string): string | number | boolean {
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return v;
}

export function ProductFormScreen({ productId }: { productId?: number }) {
  //const isAdmin = useRequireAdmin();
  const isEdit = productId !== undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [unit, setUnit] = useState("piece");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [attrs, setAttrs] = useState<AttrRow[]>([]);
  // replace localImageUri/existingThumb state with:
  const [images, setImages] = useState<{ id: number; thumbnailUrl: string }[]>(
    [],
  );
  const [savedProductId, setSavedProductId] = useState<number | undefined>(
    productId,
  );

  useEffect(() => {
    catalogApi.getCategories().then(setCategories);
    if (isEdit) {
      catalogApi
        .getProduct(productId!)
        .then((p) => {
          setName(p.name);
          setDescription(p.description ?? "");
          setPrice(String(p.price));
          setStock(String(p.stockQuantity));
          setUnit(p.unit ?? "piece");
          setCategoryId(p.categoryId);
          setAttrs(
            Object.entries(p.attributes ?? {}).map(([key, value]) => ({
              key,
              value: String(value),
            })),
          );
          setImages(
            p.images.map((img) => ({
              id: img.id,
              thumbnailUrl: img.thumbnailUrl,
            })),
          );
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  //if (!isAdmin) return null;

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  function updateAttr(index: number, field: keyof AttrRow, text: string) {
    setAttrs((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: text } : a)),
    );
  }
  async function pickAndUploadImage() {
    if (!savedProductId) {
      Alert.alert("Save first", "Save the product before adding photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled) return;
    const updated = await adminApi.addImage(
      savedProductId,
      result.assets[0].uri,
    );
    setImages(
      updated.images.map((img) => ({
        id: img.id,
        thumbnailUrl: img.thumbnailUrl,
      })),
    );
  }

  async function handleRemoveImage(imageId: number) {
    if (!savedProductId) return;
    const updated = await adminApi.removeImage(savedProductId, imageId);
    setImages(
      updated.images.map((img) => ({
        id: img.id,
        thumbnailUrl: img.thumbnailUrl,
      })),
    );
  }
  async function handleSave() {
    if (!name.trim() || !price || !stock || categoryId === null) {
      Alert.alert(
        "Missing info",
        "Name, price, stock and category are required.",
      );
      return;
    }
    if (isNaN(Number(price)) || isNaN(Number(stock))) {
      Alert.alert("Invalid number", "Price and stock must be numbers.");
      return;
    }

    const attributes: Record<string, any> = {};
    attrs
      .filter((a) => a.key.trim())
      .forEach((a) => {
        attributes[a.key.trim()] = parseAttrValue(a.value);
      });

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      categoryId,
      stockQuantity: Number(stock),
      unit: unit.trim() || "piece",
      attributes,
    };

    setSaving(true);
    try {
      const saved = isEdit
        ? await adminApi.updateProduct(savedProductId!, payload)
        : await adminApi.createProduct(payload);
      setSavedProductId(saved.id);
      if (!isEdit) {
        Alert.alert("Product created", "You can now add photos below.");
      } else {
        router.back();
      }
    } catch (err: any) {
      Alert.alert(
        "Save failed",
        err.response?.data?.message ?? "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Photos</Text>
      <View style={styles.gallery}>
        {images.map((img) => (
          <View key={img.id} style={styles.thumbWrap}>
            <Image
              source={{ uri: `${IMAGE_BASE_URL}${img.thumbnailUrl}` }}
              style={styles.adminThumb}
            />
            <Pressable
              style={styles.removeBadge}
              onPress={() => handleRemoveImage(img.id)}
            >
              <Text style={styles.removeBadgeText}>✕</Text>
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.addThumb} onPress={pickAndUploadImage}>
          <Text style={{ fontSize: 24, color: "#888" }}>+</Text>
        </Pressable>
      </View>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Stock</Text>
          <TextInput
            style={styles.input}
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Unit</Text>
          <TextInput
            style={styles.input}
            value={unit}
            onChangeText={setUnit}
            autoCapitalize="none"
          />
        </View>
      </View>

      <Text style={styles.label}>Category</Text>
      <View style={styles.chips}>
        {categories.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
            onPress={() => setCategoryId(c.id)}
          >
            <Text
              style={
                categoryId === c.id ? styles.chipTextActive : styles.chipText
              }
            >
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Attributes (category-specific)</Text>
      {attrs.map((a, i) => (
        <View key={i} style={styles.attrRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="key"
            value={a.key}
            onChangeText={(t) => updateAttr(i, "key", t)}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="value"
            value={a.value}
            onChangeText={(t) => updateAttr(i, "value", t)}
            autoCapitalize="none"
          />
          <Pressable
            onPress={() =>
              setAttrs((prev) => prev.filter((_, idx) => idx !== i))
            }
          >
            <Text style={styles.remove}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        onPress={() => setAttrs((prev) => [...prev, { key: "", value: "" }])}
      >
        <Text style={styles.addAttr}>+ Add attribute</Text>
      </Pressable>

      <Pressable
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 12,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  row: { flexDirection: "row", gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: "#111", borderColor: "#111" },
  chipText: { color: "#333" },
  chipTextActive: { color: "#fff" },
  attrRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  remove: { color: "#c0392b", fontSize: 16, paddingHorizontal: 4 },
  addAttr: { color: "#2563eb", fontWeight: "600", marginTop: 4 },
  saveButton: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveText: { color: "#fff", fontWeight: "600" },
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbWrap: { position: "relative" },
  adminThumb: { width: 70, height: 70, borderRadius: 8 },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#c0392b",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeBadgeText: { color: "#fff", fontSize: 12 },
  addThumb: {
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
});
