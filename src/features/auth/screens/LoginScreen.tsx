import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { PasswordInput } from "@/shared/components/PasswordInput";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { MAX_EMAIL, MAX_PASSWORD } from "@/shared/constants/limits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { useTranslation } from "@/i18n";
import { colors, fonts, space } from "@/shared/theme";
import { useAuth } from "../context/AuthContext";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { t } = useTranslation();

  const { run: handleLogin, pending } = useAsyncAction(
    async () => {
      if (!email || !password) {
        Alert.alert(t("auth.missingInfo"), t("auth.missingInfoMessage"));
        return; // leaving early is fine, the hook still releases its lock
      }
      await login(email, password);
      router.replace("/(tabs)");
    },
    { errorTitleKey: "auth.loginFailed" },
  );

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="display">{t("auth.welcomeBack")}</AppText>
      <AppText color={colors.muted} style={{ marginBottom: space.xl }}>
        {t("auth.loginSubtitle")}
      </AppText>

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
        placeholder={t("auth.passwordPlaceholder")}
        value={password}
        onChangeText={setPassword}
        maxLength={MAX_PASSWORD}
      />

      <Button
        label={t("auth.login")}
        loading={pending}
        onPress={() => handleLogin()}
        style={{ marginTop: space.sm }}
      />
      <Pressable onPress={() => router.push("/auth/register")} style={s.switch}>
        <AppText color={colors.muted}>{t("auth.newHere")}</AppText>
        <AppText color={colors.sea} style={{ fontFamily: fonts.bold }}>
          {t("auth.createAccount")}
        </AppText>
      </Pressable>

      <View style={s.language}>
        <LanguageSwitcher />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, padding: space.xl, justifyContent: "center" },
  switch: { flexDirection: "row", justifyContent: "center", marginTop: space.xl },
  language: { marginTop: space.xxl },
});
