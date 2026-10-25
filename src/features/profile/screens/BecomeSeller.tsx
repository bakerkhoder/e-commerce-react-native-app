import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { MAX_FULL_NAME } from "@/shared/constants/limits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { colors, space } from "@/shared/theme";
import { sellerApplicationApi } from "../api/sellerApplicationApi";

export function BecomeSellerScreen() {
  const [businessName, setBusinessName] = useState("");

  const { run: handleSubmit, pending: submitting } = useAsyncAction(
    async () => {
      if (!businessName.trim()) {
        Alert.alert("Missing info", "Please enter a business name.");
        return;
      }
      await sellerApplicationApi.apply(businessName.trim());
      Alert.alert(
        "Application submitted",
        "We'll review it and let you know once approved.",
      );
      router.back();
    },
    { errorTitle: "Could not submit" },
  );

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="display">Sell with us</AppText>
      <AppText color={colors.muted} style={{ marginBottom: space.xl }}>
        Tell us the name you trade under. An admin reviews every application before
        your products go live.
      </AppText>

      <Input
        label="Business name"
        icon="briefcase"
        placeholder="e.g. Baladi Farm"
        value={businessName}
        onChangeText={setBusinessName}
        maxLength={MAX_FULL_NAME}
      />
      <Button
        label="Submit application"
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
