import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IMAGE_BASE_URL } from "../../../api/client";
import { ProductImage } from "../types";
import { colors, radius } from "@/shared/theme";

export function ProductGallery({
  images,
  tint = colors.chalk,
}: {
  images: ProductImage[];
  /** Aisle tint behind the photo, so the page carries the category's colour. */
  tint?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <View style={[styles.mainPlaceholder, { backgroundColor: tint }]}>
        <Ionicons name="image-outline" size={64} color={colors.muted} />
      </View>
    );
  }

  const active = images[activeIndex];

  return (
    <View>
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${active.imageUrl}` }}
        style={[styles.mainImage, { backgroundColor: tint }]}
        resizeMode="cover"
      />
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbRow}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        >
          {images.map((img, i) => (
            <Pressable key={img.id} onPress={() => setActiveIndex(i)}>
              <Image
                source={{ uri: `${IMAGE_BASE_URL}${img.thumbnailUrl}` }}
                style={[styles.thumb, i === activeIndex && styles.thumbActive]}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainImage: { width: "100%", height: 360 },
  mainPlaceholder: {
    width: "100%",
    height: 360,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbRow: { flexGrow: 0, height: 76, marginTop: 12 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: radius.input,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbActive: { borderColor: colors.sea },
});
