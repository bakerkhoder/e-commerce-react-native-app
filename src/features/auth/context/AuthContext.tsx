import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "../api/authApi";
import { Role, User } from "../types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    city?: string,
    addressLine?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, check if a token/user was already saved from a previous session
  useEffect(() => {
    AsyncStorage.getItem("authUser").then((stored) => {
      if (stored) setUser(JSON.parse(stored));
      setIsLoading(false);
    });
  }, []);

  async function persistSession(response: {
    token: string;
    userId: number;
    email: string;
    fullName: string;
    role: Role;
  }) {
    const loggedInUser: User = {
      userId: response.userId,
      email: response.email,
      fullName: response.fullName,
      role: response.role,
    };
    await AsyncStorage.setItem("authToken", response.token);
    await AsyncStorage.setItem("authUser", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }

  async function login(email: string, password: string) {
    const response = await authApi.login(email, password);
    await persistSession(response);
  }

  async function register(
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    city?: string,
    addressLine?: string,
  ) {
    const response = await authApi.register(
      email,
      password,
      fullName,
      phone,
      city,
      addressLine,
    );
    await persistSession(response);
  }

  async function logout() {
    await AsyncStorage.multiRemove(["authToken", "authUser"]);
    setUser(null);
  }
  // 2) next to logout():
  async function updateUser(updated: User) {
    await AsyncStorage.setItem("authUser", JSON.stringify(updated));
    setUser(updated);
  }
  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
