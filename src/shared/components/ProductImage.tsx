import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { IMAGE_BASE_URL } from "../../api/client";

export function ProductImage({
  url,
  size,
}: {
  url: string | null;
  size: number;
}) {
  // Handle local file URIs (e.g. from local device image picker)
  if (url && url.startsWith("file://")) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: 8 }}
        resizeMode="cover"
      />
    );
  }

  if (!url) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }]}>
        <Ionicons name="image-outline" size={size * 0.4} color="#bbb" />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `${IMAGE_BASE_URL}${url}` }}
      style={{ width: size, height: size, borderRadius: 8 }}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#eee",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
