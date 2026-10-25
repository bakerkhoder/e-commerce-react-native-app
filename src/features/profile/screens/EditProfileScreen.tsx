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

export function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { run: handleSaveProfile, pending: savingProfile } = useAsyncAction(
    async () => {
      if (!fullName.trim()) {
        Alert.alert("Missing info", "Please enter your name.");
        return;
      }
      const updated = await profileApi.updateProfile(fullName.trim());
      await updateUser(updated);
      Alert.alert("Saved", "Your profile was updated.");
    },
    { errorTitle: "Could not save" },
  );

  const { run: handleChangePassword, pending: savingPassword } = useAsyncAction(
    async () => {
      if (!currentPassword || !newPassword) {
        Alert.alert("Missing info", "Please fill in both password fields.");
        return;
      }
      if (newPassword.length < MIN_PASSWORD) {
        Alert.alert(
          "Weak password",
          `New password must be at least ${MIN_PASSWORD} characters.`,
        );
        return;
      }
      if (newPassword.length > MAX_PASSWORD) {
        Alert.alert(
          "Password too long",
          `New password must be at most ${MAX_PASSWORD} characters.`,
        );
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert("Mismatch", "New password and confirmation do not match.");
        return;
      }
      await profileApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert(
        "Password changed",
        "Use your new password next time you log in.",
      );
    },
    { errorTitle: "Could not change password" },
  );

  if (!user) {
    return (
      <EmptyState
        icon="user"
        title="You're not logged in"
        message="Log in first to edit your profile."
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <AppText variant="heading" style={s.section}>
        Your details
      </AppText>
      <Input
        label="Email"
        icon="mail"
        value={user.email}
        editable={false}
        style={{ color: colors.muted }}
      />
      <Input
        label="Full name"
        icon="user"
        placeholder="Your name"
        value={fullName}
        onChangeText={setFullName}
        maxLength={MAX_FULL_NAME}
      />
      <Button
        label="Save changes"
        loading={savingProfile}
        onPress={() => handleSaveProfile()}
      />

      <AppText variant="heading" style={[s.section, { marginTop: space.xxl }]}>
        Change password
      </AppText>
      <PasswordInput
        label="Current password"
        placeholder="Your current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <PasswordInput
        label="New password"
        placeholder={`At least ${MIN_PASSWORD} characters`}
        value={newPassword}
        onChangeText={setNewPassword}
        maxLength={MAX_PASSWORD}
      />
      <PasswordInput
        label="Confirm new password"
        placeholder="Repeat the new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        maxLength={MAX_PASSWORD}
      />
      <Button
        label="Update password"
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
