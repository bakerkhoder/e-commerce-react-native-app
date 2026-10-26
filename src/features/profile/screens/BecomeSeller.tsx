import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { MAX_FULL_NAME } from "@/shared/constants/limits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { colors, space } from "@/shared/theme";
import { useTranslation } from "@/i18n";
import { sellerApplicationApi } from "../api/sellerApplicationApi";

export function BecomeSellerScreen() {
  const [businessName, setBusinessName] = useState("");
  const { t } = useTranslation();

  const { run: handleSubmit, pending: submitting } = useAsyncAction(
    async () => {
      if (!businessName.trim()) {
        Alert.alert(t("auth.missingInfo"), t("seller.enterBusinessName"));
        return;
      }
      await sellerApplicationApi.apply(businessName.trim());
      Alert.alert(
        t("seller.submittedTitle2"),
        "We'll review it and let you know once approved.",
      );
      router.back();
    },
    { errorTitleKey: "seller.submitFailed" },
  );

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="display">{t("seller.title")}</AppText>
      <AppText color={colors.muted} style={{ marginBottom: space.xl }}>
        {t("seller.subtitle")}
      </AppText>

      <Input
        label={t("seller.businessName")}
        icon="briefcase"
        placeholder={t("seller.businessNamePlaceholder")}
        value={businessName}
        onChangeText={setBusinessName}
        maxLength={MAX_FULL_NAME}
      />
      <Button
        label={t("seller.submit")}
        loading={submitting}
        onPress={() => handleSubmit()}
        style={{ marginTop: space.sm }}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, padding: space.xl, justifyContent: "center" },
});
