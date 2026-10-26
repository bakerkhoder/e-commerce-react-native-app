import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../auth/context/AuthContext";
import { AppText } from "@/shared/components/AppText";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { LanguageSwitcher } from "@/shared/components/LanguageSwitcher";
import { ListGroup, ListRow } from "@/shared/components/ListRow";
import { useTranslation } from "@/i18n";
import { colors, space } from "@/shared/theme";

export function AccountScreen() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // Signed out, language is still reachable: it must not be locked behind a login.
  if (!user) {
    return (
      <ScrollView contentContainerStyle={s.signedOut}>
        <EmptyState
          icon="user"
          title={t("account.notLoggedTitle")}
          message={t("account.notLoggedMessage")}
          action={{
            label: t("account.login"),
            onPress: () => router.replace("/auth/login"),
          }}
        />

        <AppText variant="heading" style={s.section}>
          {t("account.language")}
        </AppText>
        <LanguageSwitcher />
      </ScrollView>
    );
  }

  const confirmLogout = () =>
    Alert.alert(
      t("account.logoutConfirmTitle"),
      t("account.logoutConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("account.logout"),
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(tabs)");
          },
        },
      ],
    );

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
              {isAdmin ? t("account.admin") : t("account.seller")}
            </AppText>
          )}
        </View>
      </View>

      <AppText variant="heading" style={s.section}>
        {t("account.shopping")}
      </AppText>
      <ListGroup>
        <ListRow
          icon="package"
          label={t("account.myOrders")}
          onPress={() => router.push("/orders")}
        />
      </ListGroup>

      {(isAdmin || isSeller) && (
        <>
          <AppText variant="heading" style={s.section}>
            {t("account.manageShop")}
          </AppText>
          <ListGroup>
            <ListRow
              icon="bar-chart-2"
              label={t("account.dashboard")}
              onPress={() => router.push("/manage/dashboard")}
            />
            <ListRow
              icon="box"
              label={isAdmin ? t("account.products") : t("account.myProducts")}
              onPress={() => router.push("/manage/products")}
            />
            {isAdmin && (
              <ListRow
                icon="check-square"
                label={t("account.approvals")}
                onPress={() => router.push("/admin/pending")}
              />
            )}
            {isAdmin && (
              <ListRow
                icon="users"
                label={t("account.sellerApplications")}
                onPress={() => router.push("/admin/seller-applications")}
              />
            )}
            {isAdmin && (
              <ListRow
                icon="list"
                label={t("account.allOrders")}
                onPress={() => router.push("/admin/orders")}
              />
            )}
          </ListGroup>
        </>
      )}

      <AppText variant="heading" style={s.section}>
        {t("account.language")}
      </AppText>
      <LanguageSwitcher />

      <AppText variant="heading" style={s.section}>
        {t("account.settings")}
      </AppText>
      <ListGroup>
        <ListRow
          icon="edit-2"
          label={t("account.editProfile")}
          onPress={() => router.push("/account/edit")}
        />
        {user.role === "CUSTOMER" && (
          <ListRow
            icon="briefcase"
            label={t("account.sellWithUs")}
            onPress={() => router.push("/account/become-seller")}
          />
        )}
        <ListRow
          icon="log-out"
          label={t("account.logout")}
          tone="danger"
          onPress={confirmLogout}
        />
      </ListGroup>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: space.lg, paddingBottom: space.xxl },
  signedOut: { flexGrow: 1, padding: space.lg, paddingBottom: space.xxl },
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
