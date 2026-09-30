import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { sellerApplicationApi } from "../api/sellerApplicationApi";

export function BecomeSellerScreen() {
  const [businessName, setBusinessName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!businessName.trim()) {
      Alert.alert("Missing info", "Please enter a business name.");
      return;
    }
    setSubmitting(true);
    try {
      await sellerApplicationApi.apply(businessName.trim());
      Alert.alert(
        "Application submitted",
        "We'll review it and let you know once approved.",
      );
      router.back();
    } catch (err: any) {
      Alert.alert(
        "Could not submit",
        err.response?.data?.message ?? "Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sell on our marketplace</Text>
      <Text style={styles.subtitle}>
        Tell us about your business to get started.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Business name"
        value={businessName}
        onChangeText={setBusinessName}
      />
      <Pressable
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Submitting..." : "Submit Application"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#666", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
