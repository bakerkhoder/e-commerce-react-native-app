import { PasswordInput } from "@/shared/components/PasswordInput";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
    {
      errorTitle: "Could not save",
      fallbackMessage: "Please try again.",
    },
  );

  const { run: handleChangePassword, pending: savingPassword } = useAsyncAction(
    async () => {
      if (!currentPassword || !newPassword) {
        Alert.alert("Missing info", "Please fill in both password fields.");
        return;
      }
      if (newPassword.length < 8) {
        Alert.alert(
          "Weak password",
          "New password must be at least 8 characters.",
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
    {
      errorTitle: "Could not change password",
      fallbackMessage: "Please try again.",
    },
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Please log in first.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.section}>Profile</Text>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, styles.readOnly]}
        value={user.email}
        editable={false}
      />
      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
      />
      <Pressable
        style={styles.button}
        onPress={() => handleSaveProfile()}
        disabled={savingProfile}
      >
        <Text style={styles.buttonText}>
          {savingProfile ? "Saving..." : "Save Changes"}
        </Text>
      </Pressable>

      <Text style={[styles.section, { marginTop: 32 }]}>Change password</Text>

      <PasswordInput
        placeholder="Current password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />

      <PasswordInput
        placeholder="New password (min 8 characters)"
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={[styles.input, { marginTop: 10 }]}
        placeholder="Confirm new password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Pressable
        style={styles.button}
        onPress={() => handleChangePassword()}
        disabled={savingPassword}
      >
        <Text style={styles.buttonText}>
          {savingPassword ? "Updating..." : "Update Password"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, paddingBottom: 48 },
  section: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  readOnly: { backgroundColor: "#f2f2f2", color: "#777" },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
