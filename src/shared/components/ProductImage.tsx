import { Feather } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { IMAGE_BASE_URL } from "../../api/client";
import { colors, radius } from "../theme";

export function ProductImage({
  url,
  size,
  radius: r = radius.input,
}: {
  url: string | null;
  size: number;
  radius?: number;
}) {
  // Handle local file URIs (e.g. from local device image picker)
  if (url && url.startsWith("file://")) {
    return (
      <Image
        source={{ uri: url }}
        style={{ width: size, height: size, borderRadius: r }}
        resizeMode="cover"
      />
    );
  }

  if (!url) {
    return (
      <View
        style={[styles.placeholder, { width: size, height: size, borderRadius: r }]}
      >
        <Feather name="image" size={size * 0.34} color={colors.muted} />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: `${IMAGE_BASE_URL}${url}` }}
      style={{ width: size, height: size, borderRadius: r }}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.chalk,
    justifyContent: "center",
    alignItems: "center",
  },
});
