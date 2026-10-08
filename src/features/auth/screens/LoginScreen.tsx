import { PasswordInput } from "@/shared/components/PasswordInput";
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

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const { run: handleLogin, pending } = useAsyncAction(
    async () => {
      if (!email || !password) {
        Alert.alert("Missing info", "Please enter both email and password.");
        return; // leaving early is fine, the hook still releases its lock
      }
      await login(email, password);
      router.replace("/(tabs)");
    },
    {
      errorTitle: "Login failed",
      fallbackMessage: "Invalid email or password.",
    },
  );
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <PasswordInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable
        style={styles.button}
        onPress={() => handleLogin()}
        disabled={pending}
      >
        <Text style={styles.buttonText}>
          {pending ? "Logging in..." : "Log In"}
        </Text>
      </Pressable>
      <Pressable onPress={() => router.push("/auth/register")}>
        <Text style={styles.link}>No account? Register</Text>
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
  link: { color: "#555", textAlign: "center", marginTop: 16 },
});
