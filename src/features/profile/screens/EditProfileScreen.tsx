import { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { PasswordInput } from "@/shared/components/PasswordInput";
import {
  MAX_FULL_NAME,
  MAX_PASSWORD,
  MIN_PASSWORD,
} from "@/shared/constants/limits";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { Input } from "@/shared/components/Input";
import { colors, space } from "@/shared/theme";
import { useAuth } from "../../auth/context/AuthContext";
import { profileApi } from "../api/profileApi";
import { useTranslation } from "@/i18n";

export function EditProfileScreen() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { run: handleSaveProfile, pending: savingProfile } = useAsyncAction(
    async () => {
      if (!fullName.trim()) {
        Alert.alert(t("auth.missingInfo"), t("profile.enterName"));
        return;
      }
      const updated = await profileApi.updateProfile(fullName.trim());
      await updateUser(updated);
      Alert.alert(t("profile.saved"), t("profile.savedMessage"));
    },
    { errorTitleKey: "profile.saveFailed" },
  );

  const { run: handleChangePassword, pending: savingPassword } = useAsyncAction(
    async () => {
      if (!currentPassword || !newPassword) {
        Alert.alert(t("auth.missingInfo"), t("profile.fillBothPasswords"));
        return;
      }
      if (newPassword.length < MIN_PASSWORD) {
        Alert.alert(
          t("profile.weakPasswordTitle"),
          t("profile.minPassword", { count: MIN_PASSWORD }),
        );
        return;
      }
      if (newPassword.length > MAX_PASSWORD) {
        Alert.alert(
          t("profile.passwordTooLongTitle"),
          t("profile.maxPassword", { count: MAX_PASSWORD }),
        );
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert(t("profile.mismatch"), t("profile.mismatchMessage"));
        return;
      }
      await profileApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert(
        t("profile.passwordChangedTitle"),
        t("profile.passwordChangedBody"),
      );
    },
    { errorTitleKey: "profile.changePasswordFailed" },
  );

  if (!user) {
    return (
      <EmptyState
        icon="user"
        title={t("account.notLoggedTitle")}
        message={t("profile.editNotLoggedMessage")}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="heading" style={s.section}>
        {t("profile.yourDetails")}
      </AppText>
      <Input
        label={t("auth.email")}
        icon="mail"
        value={user.email}
        editable={false}
        style={{ color: colors.muted }}
      />
      <Input
        label={t("auth.fullName")}
        icon="user"
        placeholder={t("auth.namePlaceholder")}
        value={fullName}
        onChangeText={setFullName}
        maxLength={MAX_FULL_NAME}
      />
      <Button
        label={t("profile.saveChanges")}
        loading={savingProfile}
        onPress={() => handleSaveProfile()}
      />

      <AppText variant="heading" style={[s.section, { marginTop: space.xxl }]}>
                {t("profile.changePassword")}
      </AppText>
      <PasswordInput
        label={t("profile.currentPassword")}
        placeholder={t("profile.currentPasswordPlaceholder")}
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <PasswordInput
        label={t("profile.newPassword")}
        placeholder={t("profile.minPasswordPlaceholder", { count: MIN_PASSWORD })}
        value={newPassword}
        onChangeText={setNewPassword}
        maxLength={MAX_PASSWORD}
      />
      <PasswordInput
        label={t("profile.confirmPassword")}
        placeholder={t("profile.confirmPasswordPlaceholder")}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        maxLength={MAX_PASSWORD}
      />
      <Button
        label={t("profile.updatePassword")}
        loading={savingPassword}
        onPress={() => handleChangePassword()}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: space.lg, paddingBottom: space.xxl },
  section: { marginBottom: space.md },
});
