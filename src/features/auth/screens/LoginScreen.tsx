import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { MAX_EMAIL, MAX_PASSWORD } from "@/shared/constants/limits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { colors, fonts, space } from "@/shared/theme";
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
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="display">Welcome back</AppText>
      <AppText color={colors.muted} style={{ marginBottom: space.xl }}>
        Log in to see your orders and check out faster.
      </AppText>

      <Input
        label="Email"
        icon="mail"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        maxLength={MAX_EMAIL}
      />
      <PasswordInput
        label="Password"
        placeholder="Your password"
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD}
      />

      <Button
        label="Log in"
        loading={pending}
        onPress={() => handleLogin()}
        style={{ marginTop: space.sm }}
      />
      <Pressable onPress={() => router.push("/auth/register")} style={s.switch}>
        <AppText color={colors.muted}>New here? </AppText>
        <AppText color={colors.sea} style={{ fontFamily: fonts.bold }}>
          Create an account
        </AppText>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, padding: space.xl, justifyContent: "center" },
  switch: { flexDirection: "row", justifyContent: "center", marginTop: space.xl },
});
