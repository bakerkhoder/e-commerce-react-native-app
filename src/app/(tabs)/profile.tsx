import { useAuth } from "@/features/auth/context/AuthContext";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ProfileTab() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>You're not logged in yet.</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.buttonText}>Log In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user.role === "ADMIN" && (
        <Pressable
          style={[
            styles.button,
            { backgroundColor: "#2563eb", marginBottom: 12 },
          ]}
          onPress={() => router.push("/admin/products")}
        >
          <Text style={styles.buttonText}>Manage Products</Text>
        </Pressable>
      )}
      <Text style={styles.name}>{user.fullName}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Pressable style={[styles.button, styles.logoutButton]} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  message: { fontSize: 16, marginBottom: 16 },
  name: { fontSize: 20, fontWeight: "700" },
  email: { fontSize: 14, color: "#666", marginTop: 4, marginBottom: 24 },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  logoutButton: { backgroundColor: "#c0392b" },
  buttonText: { color: "#fff", fontWeight: "600" },
});
