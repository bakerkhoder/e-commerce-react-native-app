import { PasswordInput } from "@/shared/components/PasswordInput";
import {
  MAX_ADDRESS,
  MAX_CITY,
  MAX_EMAIL,
  MAX_FULL_NAME,
  MAX_PASSWORD,
  MAX_PHONE,
  MIN_PASSWORD,
} from "@/shared/constants/limits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
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
import { useAuth } from "../context/AuthContext";

export function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const { register } = useAuth();

  const { run: handleRegister, pending } = useAsyncAction(
    async () => {
      if (!fullName || !email || !password) {
        Alert.alert("Missing info", "Please fill in all fields.");
        return;
      }
      if (password.length < MIN_PASSWORD) {
        Alert.alert(
          "Password too short",
          `Use at least ${MIN_PASSWORD} characters.`,
        );
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        Alert.alert("Invalid email", "Please enter a valid email address.");
        return;
      }
      await register(
        email.trim(),
        password,
        fullName,
        phone || undefined,
        city || undefined,
        addressLine || undefined,
      );
      router.replace("/(tabs)");
    },
    {
      errorTitle: "Registration failed",
      fallbackMessage: "Please try again.",
    },
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
        maxLength={MAX_FULL_NAME}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        maxLength={MAX_EMAIL}
      />

      <PasswordInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD}
      />
      <Text style={styles.hint}>
        {password.length < MIN_PASSWORD
          ? `At least ${MIN_PASSWORD} characters`
          : " "}
      </Text>
      <Text style={styles.optionalLabel}>
        Delivery info (optional — speeds up checkout later)
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={MAX_PHONE}
      />
      <TextInput
        style={styles.input}
        placeholder="City / Area"
        value={city}
        onChangeText={setCity}
        maxLength={MAX_CITY}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={addressLine}
        onChangeText={setAddressLine}
        maxLength={MAX_ADDRESS}
      />
      <Pressable
        style={styles.button}
        onPress={() => handleRegister()}
        disabled={pending}
      >
        <Text style={styles.buttonText}>
          {pending ? "Creating..." : "Create Account"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  optionalLabel: {
    fontSize: 12,
    color: "#888",
    marginTop: 12,
    marginBottom: 6,
  },
  hint: { fontSize: 12, color: "#888", marginBottom: 4 },
});
