import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useFonts } from "@expo-google-fonts/cairo/useFonts";
import { Cairo_500Medium } from "@expo-google-fonts/cairo/500Medium";
import { Cairo_600SemiBold } from "@expo-google-fonts/cairo/600SemiBold";
import { Cairo_700Bold } from "@expo-google-fonts/cairo/700Bold";
import { Cairo_800ExtraBold } from "@expo-google-fonts/cairo/800ExtraBold";
import { AuthProvider } from "../features/auth/context/AuthContext";
import { CartProvider } from "../features/cart/context/CartContext";
import { I18nProvider, useTranslation } from "@/i18n";
import { colors, fonts } from "@/shared/theme";

SplashScreen.preventAutoHideAsync();

/**
 * Lives inside I18nProvider so screen titles follow the selected language. Expo Router
 * picks up these configs from the layout tree, so they stay declared here.
 */
function RootNavigator() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.chalk },
        headerShadowVisible: false,
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: fonts.black, fontSize: 18 },
        contentStyle: { backgroundColor: colors.chalk },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{ title: "", headerTransparent: true }}
      />
      <Stack.Screen name="auth/login" options={{ title: t("auth.login") }} />
      <Stack.Screen
        name="auth/register"
        options={{ title: t("auth.register") }}
      />
      <Stack.Screen name="account/index" options={{ title: t("header.account") }} />
      <Stack.Screen
        name="account/edit"
        options={{ title: t("account.editProfile") }}
      />
      <Stack.Screen
        name="account/become-seller"
        options={{ title: t("account.sellWithUs") }}
      />
      <Stack.Screen name="orders/index" options={{ title: t("account.myOrders") }} />
      <Stack.Screen name="orders/[id]" options={{ title: t("orders.order", { id: "" }) }} />
      <Stack.Screen name="checkout" options={{ title: t("cart.checkout") }} />
      <Stack.Screen
        name="manage/products"
        options={{ title: t("account.products") }}
      />
      <Stack.Screen
        name="manage/product-form"
        options={{ title: t("form.name") }}
      />
      <Stack.Screen
        name="manage/dashboard"
        options={{ title: t("account.dashboard") }}
      />
      <Stack.Screen
        name="manage/record"
        options={{ title: t("record.purchaseTitle") }}
      />
      <Stack.Screen
        name="admin/pending"
        options={{ title: t("account.approvals") }}
      />
      <Stack.Screen
        name="admin/seller-applications"
        options={{ title: t("account.sellerApplications") }}
      />
      <Stack.Screen
        name="admin/orders"
        options={{ title: t("account.allOrders") }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <I18nProvider>
      <AuthProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
