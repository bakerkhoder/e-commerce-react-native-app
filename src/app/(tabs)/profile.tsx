import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../features/auth/context/AuthContext";

function MenuRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowText}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export default function ProfileTab() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <View style={styles.center}>
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
      <View style={styles.header}>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <MenuRow label="My Orders" onPress={() => router.push("/orders")} />
      <MenuRow
        label="Edit Profile"
        onPress={() => router.push("/account/edit")}
      />
      {user.role === "SELLER" && (
        <MenuRow
          label="My Products"
          onPress={() => router.push("/manage/products")}
        />
      )}
      {user.role === "ADMIN" && (
        <>
          <MenuRow
            label="Manage Products"
            onPress={() => router.push("/manage/products")}
          />
          <MenuRow
            label="Pending Products"
            onPress={() => router.push("/admin/pending")}
          />
          <MenuRow
            label="Seller Applications"
            onPress={() => router.push("/admin/seller-applications")}
          />
        </>
      )}
      {user.role === "CUSTOMER" && (
        <MenuRow
          label="Become a Seller"
          onPress={() => router.push("/account/become-seller")}
        />
      )}
      <Pressable style={[styles.button, styles.logout]} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: { alignItems: "center", marginBottom: 24, marginTop: 8 },
  name: { fontSize: 20, fontWeight: "700" },
  email: { fontSize: 14, color: "#666", marginTop: 4 },
  message: { fontSize: 16, marginBottom: 16 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowText: { fontSize: 16 },
  chevron: { fontSize: 22, color: "#aaa" },
  button: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  logout: { backgroundColor: "#c0392b", marginTop: 32 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
