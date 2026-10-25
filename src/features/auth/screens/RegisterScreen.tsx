import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet } from "react-native";
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
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { colors, fonts, space } from "@/shared/theme";
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
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="display">Create account</AppText>
      <AppText color={colors.muted} style={{ marginBottom: space.xl }}>
        It takes a minute, and checkout gets faster afterwards.
      </AppText>

      <Input
        label="Full name"
        icon="user"
        placeholder="Your name"
        value={fullName}
        onChangeText={setFullName}
        maxLength={MAX_FULL_NAME}
      />
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
        placeholder="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD}
      />

      <AppText variant="small" color={colors.muted} style={{ marginTop: space.sm }}>
        Delivery details are optional, and they speed up checkout later.
      </AppText>

      <Input
        label="Phone"
        icon="phone"
        placeholder="+961 …"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={MAX_PHONE}
      />
      <Input
        label="City / area"
        icon="map-pin"
        placeholder="Akkar, Beirut …"
        value={city}
        onChangeText={setCity}
        maxLength={MAX_CITY}
      />
      <Input
        label="Address"
        icon="home"
        placeholder="Street and building"
        value={addressLine}
        onChangeText={setAddressLine}
        maxLength={MAX_ADDRESS}
      />

      <Button
        label="Create account"
        loading={pending}
        onPress={() => handleRegister()}
        style={{ marginTop: space.sm }}
      />
      <Pressable onPress={() => router.push("/auth/login")} style={s.switch}>
        <AppText color={colors.muted}>Already have an account? </AppText>
        <AppText color={colors.sea} style={{ fontFamily: fonts.bold }}>
          Log in
        </AppText>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, padding: space.xl, paddingTop: space.xxl },
  switch: { flexDirection: "row", justifyContent: "center", marginTop: space.xl },
});
