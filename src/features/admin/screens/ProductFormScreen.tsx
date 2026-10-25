import { LoadingOverlay } from "@/shared/components/LoadingOverlay";
import {
  MAX_DESCRIPTION,
  MAX_NAME,
  MAX_PHOTOS,
  MAX_UNIT,
} from "@/shared/constants/limits";
import { apiErrorMessage } from "@/shared/utils/apiError";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { aisle, colors, radius, space } from "@/shared/theme";
import { Feather } from "@expo/vector-icons";
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savedProductId, setSavedProductId] = useState<number | undefined>(
    productId,
  );

  const isPersisted = savedProductId !== undefined; // true once a real row exists — from edit mode, OR from a create earlier in this same session

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
  async function pickImage() {
    if (!savedProductId) {
      Alert.alert("Save first", "Save the product before adding photos.");
      return;
    }
    if (images.length >= MAX_PHOTOS) {
      Alert.alert(
        "Photo limit reached",
        `A product can have at most ${MAX_PHOTOS} photos.`,
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled) return;

    setUploadingImage(true);
    try {
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
    } catch (err: any) {
      Alert.alert("Could not add photo", apiErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  }
  async function handleRemoveImage(imageId: number) {
    if (!savedProductId) return;
    try {
      const updated = await adminApi.removeImage(savedProductId, imageId);
      setImages(
        updated.images.map((img) => ({
          id: img.id,
          thumbnailUrl: img.thumbnailUrl,
        })),
      );
    } catch (err) {
      Alert.alert("Could not remove photo", apiErrorMessage(err));
    }
  }
  async function handleSave() {
    if (saving) return; // hard stop against a double-tap racing past the disabled prop before re-render

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
      if (isPersisted) {
        // A row already exists — always update from here on, never create again
        await adminApi.updateProduct(savedProductId!, payload);
        router.back();
      } else {
        const created = await adminApi.createProduct(payload);
        setSavedProductId(created.id); // isPersisted flips to true right here — this is what actually prevents the duplicate
        Alert.alert(
          "Product created",
          "Now add some photos, then tap Done when finished.",
        );
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
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <AppText variant="small" color={colors.muted} style={styles.label}>
          Photos
        </AppText>
        <View style={styles.gallery}>
          {images.map((img) => (
            <View key={img.id} style={styles.thumbWrap}>
              <Image
                source={{ uri: `${IMAGE_BASE_URL}${img.thumbnailUrl}` }}
                style={styles.adminThumb}
              />
              <Pressable
                style={styles.removeBadge}
                accessibilityLabel="Remove photo"
                onPress={() => handleRemoveImage(img.id)}
              >
                <Feather name="x" size={12} color={colors.onSea} />
              </Pressable>
            </View>
          ))}
          <Pressable
            style={[
              styles.addThumb,
              images.length >= MAX_PHOTOS && styles.addThumbDisabled,
            ]}
            onPress={pickImage}
            disabled={uploadingImage || images.length >= MAX_PHOTOS}
            accessibilityLabel="Add photo"
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color={colors.muted} />
            ) : (
              <Feather name="plus" size={24} color={colors.muted} />
            )}
          </Pressable>
        </View>
        <AppText variant="small" color={colors.muted} style={{ marginTop: 6 }}>
          {images.length}/{MAX_PHOTOS} photos
        </AppText>

        <Input
          label="Name"
          placeholder="What are you selling"
          value={name}
          onChangeText={setName}
          maxLength={MAX_NAME}
        />
        <Input
          label="Description"
          placeholder="Tell buyers what makes it good"
          value={description}
          onChangeText={setDescription}
          multiline
          style={{ height: 84, paddingTop: 12 }}
          maxLength={MAX_DESCRIPTION}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input
              label="Price"
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Stock"
              placeholder="0"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
              maxLength={7}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Unit"
              placeholder="kg"
              value={unit}
              onChangeText={setUnit}
              autoCapitalize="none"
              maxLength={MAX_UNIT}
            />
          </View>
        </View>

        <AppText variant="small" color={colors.muted} style={styles.label}>
          Category
        </AppText>
        <View style={styles.chips}>
          {categories.map((c) => {
            const active = categoryId === c.id;
            const tone = aisle(c.id).tone;
            return (
              <Pressable
                key={c.id}
                style={[
                  styles.chip,
                  active && { backgroundColor: tone, borderColor: tone },
                ]}
                onPress={() => setCategoryId(c.id)}
                accessibilityState={{ selected: active }}
              >
                <AppText variant="small" color={active ? colors.onSea : colors.ink}>
                  {c.name}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText variant="small" color={colors.muted} style={styles.label}>
          Attributes (category-specific)
        </AppText>
        {attrs.map((a, i) => (
          <View key={i} style={styles.attrRow}>
            <Input
              placeholder="key"
              value={a.key}
              onChangeText={(t) => updateAttr(i, "key", t)}
              autoCapitalize="none"
              style={{ flex: 1 }}
            />
            <Input
              placeholder="value"
              value={a.value}
              onChangeText={(t) => updateAttr(i, "value", t)}
              autoCapitalize="none"
              style={{ flex: 1 }}
            />
            <Pressable
              hitSlop={8}
              accessibilityLabel="Remove attribute"
              onPress={() =>
                setAttrs((prev) => prev.filter((_, idx) => idx !== i))
              }
            >
              <Feather name="x" size={18} color={colors.tomato} />
            </Pressable>
          </View>
        ))}
        <Pressable
          onPress={() => setAttrs((prev) => [...prev, { key: "", value: "" }])}
        >
          <AppText variant="small" color={colors.sea} style={styles.addAttr}>
            + Add attribute
          </AppText>
        </Pressable>

        <Button
          label={
            saving
              ? "Saving..."
              : isPersisted
                ? "Save changes"
                : "Create product"
          }
          loading={saving}
          disabled={uploadingImage}
          onPress={handleSave}
          style={{ marginTop: space.xl }}
        />
      </ScrollView>
      <LoadingOverlay
        visible={saving}
        message={isEdit ? "Saving changes..." : "Creating product..."}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: space.xxl },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  label: { marginBottom: 4, marginTop: space.md },
  row: { flexDirection: "row", gap: space.sm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: space.sm },
  chip: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.surface,
  },
  attrRow: {
    flexDirection: "row",
    gap: space.sm,
    alignItems: "center",
  },
  addAttr: { marginTop: space.xs },
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  thumbWrap: { position: "relative" },
  adminThumb: { width: 70, height: 70, borderRadius: radius.input },
  removeBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.tomato,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addThumb: {
    width: 70,
    height: 70,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  addThumbDisabled: { opacity: 0.4 },
});
