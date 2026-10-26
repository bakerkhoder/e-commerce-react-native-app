import { router, Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useCart } from "../../features/cart/context/CartContext";
import { AppText } from "@/shared/components/AppText";
import { useTranslation } from "@/i18n";
import { colors, fonts } from "@/shared/theme";

function AccountButton() {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("auth.login")}
        onPress={() => router.push("/auth/login")}
        style={s.login}
      >
        <AppText variant="button" color={colors.sea}>
          {t("auth.login")}
        </AppText>
      </Pressable>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("header.account")}
      onPress={() => router.push("/account")}
      style={s.avatar}
    >
      <AppText variant="heading" color={colors.onSea}>
        {user.fullName.trim().charAt(0).toUpperCase()}
      </AppText>
    </Pressable>
  );
}

export default function TabLayout() {
  const { items } = useCart();
  const { t } = useTranslation();
  const count = items.reduce((n, i) => n + i.quantity, 0);
  // The system navigation bar (gesture pill or 3-button row) sits below the tab bar.
  // Without this the labels get clipped on phones with a large bottom inset — exactly
  // what happens on a 3-button Android device.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.chalk },
        headerShadowVisible: false,
        headerTitleAlign: "left",
        headerTitleStyle: {
          fontFamily: fonts.black,
          fontSize: 22,
          color: colors.ink,
        },
        headerRight: () => (
          <View style={{ marginEnd: 16 }}>
            <AccountButton />
          </View>
        ),
        sceneStyle: { backgroundColor: colors.chalk },
        tabBarActiveTintColor: colors.sea,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 58 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
        },
        tabBarItemStyle: { paddingVertical: 0 },
        tabBarLabelStyle: {
          fontFamily: fonts.semibold,
          fontSize: 11,
          lineHeight: 14,
          marginTop: 2,
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.shop"),
          headerTitle: t("common.appName"),
          headerTitleStyle: {
            fontFamily: fonts.black,
            fontSize: 26,
            color: colors.sea,
          },
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="home"
              size={size - 2}
              color={focused ? colors.sea : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t("tabs.ask"),
          headerTitle: t("header.askShop"),
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="message-circle"
              size={size - 2}
              color={focused ? colors.sea : colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t("tabs.cart"),
          headerTitle: t("header.yourCart"),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.tomato,
            color: colors.onSea,
            fontFamily: fonts.bold,
          },
          tabBarIcon: ({ focused, size }) => (
            <Feather
              name="shopping-bag"
              size={size - 2}
              color={focused ? colors.sea : colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const s = StyleSheet.create({
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.sea,
    alignItems: "center",
    justifyContent: "center",
  },
  login: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.sea,
    justifyContent: "center",
  },
});
