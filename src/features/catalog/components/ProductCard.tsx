import { Image, Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Product } from "../types";
import { IMAGE_BASE_URL } from "../../../api/client";
import { AppText } from "@/shared/components/AppText";
import { Price } from "@/shared/components/Price";
import { aisle, colors, radius } from "@/shared/theme";
import { formatCurrency } from "@/shared/utils/format";

export function ProductCard({ product }: { product: Product }) {
  const tone = aisle(product.categoryId);

  return (
    <Pressable
      style={s.card}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatCurrency(product.price)}`}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={[s.photo, { backgroundColor: tone.tint }]}>
        {product.thumbnailUrl ? (
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${product.thumbnailUrl}` }}
            style={s.image}
            resizeMode="cover"
          />
        ) : (
          <Feather name="package" size={32} color={tone.tone} />
        )}
        {product.stockQuantity === 0 && (
          <View style={s.soldOut}>
            <AppText variant="small" color="#fff">
              Sold out
            </AppText>
          </View>
        )}
      </View>
      <View style={s.info}>
        <AppText variant="heading" numberOfLines={1}>
          {product.name}
        </AppText>
        <AppText variant="small" color={tone.tone} numberOfLines={1}>
          {product.categoryName}
        </AppText>
        <View style={{ marginTop: 6 }}>
          <Price value={product.price} unit={product.unit} />
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radius.image,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  photo: { aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  soldOut: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: colors.ink,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  info: { padding: 10 },
});
