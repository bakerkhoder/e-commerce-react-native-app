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
import { colors, fonts } from "@/shared/theme";

SplashScreen.preventAutoHideAsync();

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
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
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
          <Stack.Screen name="auth/login" options={{ title: "Log in" }} />
          <Stack.Screen
            name="auth/register"
            options={{ title: "Create account" }}
          />
          <Stack.Screen name="account/index" options={{ title: "Account" }} />
          <Stack.Screen name="account/edit" options={{ title: "Edit profile" }} />
          <Stack.Screen
            name="account/become-seller"
            options={{ title: "Sell with us" }}
          />
          <Stack.Screen name="orders/index" options={{ title: "My orders" }} />
          <Stack.Screen name="orders/[id]" options={{ title: "Order" }} />
          <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
          <Stack.Screen name="manage/products" options={{ title: "Products" }} />
          <Stack.Screen
            name="manage/product-form"
            options={{ title: "Product" }}
          />
          <Stack.Screen name="manage/dashboard" options={{ title: "Dashboard" }} />
          <Stack.Screen name="manage/record" options={{ title: "Record entry" }} />
          <Stack.Screen
            name="admin/pending"
            options={{ title: "Product approvals" }}
          />
          <Stack.Screen
            name="admin/seller-applications"
            options={{ title: "Seller applications" }}
          />
          <Stack.Screen name="admin/orders" options={{ title: "All orders" }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
