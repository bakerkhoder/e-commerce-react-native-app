import { CartProvider } from "@/features/cart/context/CartContext";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { AuthProvider } from "../features/auth/context/AuthContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="product/[id]"
              options={{ headerShown: true, title: "Product" }}
            />
            <Stack.Screen
              name="auth/login"
              options={{ headerShown: true, title: "Log In" }}
            />
            <Stack.Screen
              name="auth/register"
              options={{ headerShown: true, title: "Register" }}
            />
            <Stack.Screen
              name="manage/products"
              options={{ headerShown: true, title: "Manage Products" }}
            />
            <Stack.Screen
              name="manage/product-form"
              options={{ headerShown: true, title: "Product" }}
            />
            <Stack.Screen
              name="orders/index"
              options={{ headerShown: true, title: "My Orders" }}
            />
            <Stack.Screen
              name="orders/[id]"
              options={{ headerShown: true, title: "Order" }}
            />
            <Stack.Screen
              name="account/edit"
              options={{ headerShown: true, title: "Edit Profile" }}
            />
            <Stack.Screen
              name="admin/seller-applications"
              options={{ headerShown: true, title: "Seller Applications" }}
            />
            <Stack.Screen
              name="checkout"
              options={{ headerShown: true, title: "Checkout" }}
            />
          </Stack>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}
