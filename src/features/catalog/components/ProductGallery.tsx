import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { IMAGE_BASE_URL } from "../../../api/client";
import { ProductImage } from "../types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <View style={styles.mainPlaceholder}>
        <Ionicons name="image-outline" size={64} color="#bbb" />
      </View>
    );
  }

  const active = images[activeIndex];

  return (
    <View>
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${active.imageUrl}` }}
        style={styles.mainImage}
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
  mainImage: { width: "100%", height: 300, backgroundColor: "#f2f2f2" },
  mainPlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  thumbRow: { flexGrow: 0, height: 76, marginTop: 12 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbActive: { borderColor: "#111" },
});
