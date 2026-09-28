import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { useColorScheme } from "react-native";
import { AuthProvider } from "../features/auth/context/AuthContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
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
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
