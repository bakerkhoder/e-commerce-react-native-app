import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../../../shared/storage/tokenStorage";
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

  // On app start, restore the session. The token comes from the OS keystore, so if it
  // is gone the cached user object is stale and we drop it rather than showing a
  // logged-in shell whose every request would 401.
  useEffect(() => {
    Promise.all([AsyncStorage.getItem("authUser"), tokenStorage.get()]).then(
      ([stored, token]) => {
        if (stored && token) {
          setUser(JSON.parse(stored));
        } else if (stored) {
          AsyncStorage.removeItem("authUser");
        }
        setIsLoading(false);
      },
    );
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
    await tokenStorage.set(response.token);
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
    await tokenStorage.clear();
    // the cached user object is not secret, so it stays in AsyncStorage
    await AsyncStorage.removeItem("authUser");
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
