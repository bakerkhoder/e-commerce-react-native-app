import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../auth/context/AuthContext";
import { AppText } from "@/shared/components/AppText";
import { EmptyState } from "@/shared/components/EmptyState";
import { ListGroup, ListRow } from "@/shared/components/ListRow";
import { colors, space } from "@/shared/theme";

export function AccountScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <EmptyState
        icon="user"
        title="You're not logged in"
        message="Log in to see your orders and save your delivery details."
        action={{ label: "Log in", onPress: () => router.replace("/auth/login") }}
      />
    );
  }

  const confirmLogout = () =>
    Alert.alert("Log out of your account?", "You can log back in anytime.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(tabs)");
        },
      },
    ]);

  const isAdmin = user.role === "ADMIN";
  const isSeller = user.role === "SELLER";

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <AppText variant="title" color={colors.onSea}>
            {user.fullName.trim().charAt(0).toUpperCase()}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="title">{user.fullName}</AppText>
          <AppText variant="small" color={colors.muted}>
            {user.email}
          </AppText>
          {(isAdmin || isSeller) && (
            <AppText variant="small" color={colors.sea}>
              {isAdmin ? "Admin" : "Seller"}
            </AppText>
          )}
        </View>
      </View>

      <AppText variant="heading" style={s.section}>
        Shopping
      </AppText>
      <ListGroup>
        <ListRow
          icon="package"
          label="My orders"
          onPress={() => router.push("/orders")}
        />
      </ListGroup>

      {(isAdmin || isSeller) && (
        <>
          <AppText variant="heading" style={s.section}>
            Manage your shop
          </AppText>
          <ListGroup>
            <ListRow
              icon="bar-chart-2"
              label="Dashboard"
              onPress={() => router.push("/manage/dashboard")}
            />
            <ListRow
              icon="box"
              label={isAdmin ? "Products" : "My products"}
              onPress={() => router.push("/manage/products")}
            />
            {isAdmin && (
              <ListRow
                icon="check-square"
                label="Product approvals"
                onPress={() => router.push("/admin/pending")}
              />
            )}
            {isAdmin && (
              <ListRow
                icon="users"
                label="Seller applications"
                onPress={() => router.push("/admin/seller-applications")}
              />
            )}
            {isAdmin && (
              <ListRow
                icon="list"
                label="All orders"
                onPress={() => router.push("/admin/orders")}
              />
            )}
          </ListGroup>
        </>
      )}

      <AppText variant="heading" style={s.section}>
        Account
      </AppText>
      <ListGroup>
        <ListRow
          icon="edit-2"
          label="Edit profile"
          onPress={() => router.push("/account/edit")}
        />
        {user.role === "CUSTOMER" && (
          <ListRow
            icon="briefcase"
            label="Sell with us"
            onPress={() => router.push("/account/become-seller")}
          />
        )}
        <ListRow
          icon="log-out"
          label="Log out"
          tone="danger"
          onPress={confirmLogout}
        />
      </ListGroup>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: space.xxl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.lg,
    marginBottom: space.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.sea,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { marginTop: space.xl, marginBottom: space.sm },
});
