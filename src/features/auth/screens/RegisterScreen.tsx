import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
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
import { useTranslation } from "@/i18n";
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
  const { t } = useTranslation();

  const { run: handleRegister, pending } = useAsyncAction(
    async () => {
      if (!fullName || !email || !password) {
        Alert.alert(t("auth.missingInfo"), t("auth.missingInfoMessage"));
        return;
      }
      if (password.length < MIN_PASSWORD) {
        Alert.alert(
          t("auth.passwordTooShort"),
          t("auth.passwordTooShortMessage", { count: MIN_PASSWORD }),
        );
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        Alert.alert(t("auth.invalidEmail"), t("auth.invalidEmailMessage"));
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
    { errorTitleKey: "auth.registerFailed" },
  );

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="display">{t("auth.createAccount")}</AppText>
      <AppText color={colors.muted} style={{ marginBottom: space.xl }}>
        {t("auth.registerSubtitle")}
      </AppText>

      <Input
        label={t("auth.fullName")}
        icon="user"
        placeholder={t("auth.namePlaceholder")}
        value={fullName}
        onChangeText={setFullName}
        maxLength={MAX_FULL_NAME}
      />
      <Input
        label={t("auth.email")}
        icon="mail"
        placeholder={t("auth.emailPlaceholder")}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        maxLength={MAX_EMAIL}
      />
      <PasswordInput
        label={t("auth.password")}
        placeholder={t("auth.passwordMinPlaceholder")}
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD}
      />

      <AppText variant="small" color={colors.muted} style={{ marginTop: space.sm }}>
        {t("auth.deliveryOptional")}
      </AppText>

      <Input
        label={t("auth.phone")}
        icon="phone"
        placeholder={t("auth.phonePlaceholder")}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={MAX_PHONE}
      />
      <Input
        label={t("auth.city")}
        icon="map-pin"
        placeholder={t("auth.cityPlaceholder")}
        value={city}
        onChangeText={setCity}
        maxLength={MAX_CITY}
      />
      <Input
        label={t("auth.address")}
        icon="home"
        placeholder={t("auth.addressPlaceholder")}
        value={addressLine}
        onChangeText={setAddressLine}
        maxLength={MAX_ADDRESS}
      />

      <Button
        label={t("auth.register")}
        loading={pending}
        onPress={() => handleRegister()}
        style={{ marginTop: space.sm }}
      />
      <Pressable onPress={() => router.push("/auth/login")} style={s.switch}>
        <AppText color={colors.muted}>{t("auth.haveAccount")}</AppText>
        <AppText color={colors.sea} style={{ fontFamily: fonts.bold }}>
          {t("auth.login")}
        </AppText>
      </Pressable>

      <View style={s.language}>
        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, padding: space.xl, paddingTop: space.xxl },
  switch: { flexDirection: "row", justifyContent: "center", marginTop: space.xl },
  language: { marginTop: space.xxl },
});
