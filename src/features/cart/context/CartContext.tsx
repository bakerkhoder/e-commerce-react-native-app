import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import { useAuth } from "../../auth/context/AuthContext";
import { Product } from "../../catalog/types";
import { showApiError } from "@/shared/utils/apiError";
import { cartApi } from "../api/cartApi";

/** Matches the backend cap in CartService; keeps guest carts and the UI in step. */
const MAX_QUANTITY = 99;
const QUANTITY_MESSAGE = `Quantity must be between 1 and ${MAX_QUANTITY}`;

export interface CartLine {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  thumbnailUrl: string | null;
  maxStock: number; // informs the +/- stepper UI; the server is always the real source of truth on write
}

interface CartContextValue {
  items: CartLine[];
  loading: boolean;
  total: number;
  isGuest: boolean;
  refresh: () => Promise<void>;
  addItem: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const GUEST_CART_KEY = "guestCart";

function fromServerCart(
  items: {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    thumbnailUrl: string | null;
  }[],
): CartLine[] {
  // maxStock drives the "+" stepper, so cap it at the backend limit instead of 9999:
  // otherwise the UI happily offers a 100th unit and the server answers 400.
  return items.map((i) => ({ ...i, maxStock: MAX_QUANTITY }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(false);
  const isGuest = !user;
  const busy = useRef(false);

  const saveGuestCart = useCallback(async (next: CartLine[]) => {
    setItems(next);
    await AsyncStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      if (user) {
        const cart = await cartApi.getCart();
        setItems(fromServerCart(cart.items));
      } else {
        const raw = await AsyncStorage.getItem(GUEST_CART_KEY);
        setItems(raw ? JSON.parse(raw) : []);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [user]);

  async function addItem(product: Product, quantity: number) {
    if (user) {
      try {
        const cart = await cartApi.addItem(product.id, quantity);
        setItems(fromServerCart(cart.items));
      } catch (err) {
        // Alerted here so no caller can turn a rejected restriction into an
        // unhandled promise rejection.
        showApiError(err, "Could not add item");
      }
    } else {
      const existing = items.find((i) => i.productId === product.id);
      const nextQuantity = (existing?.quantity ?? 0) + quantity;
      if (nextQuantity < 1 || nextQuantity > MAX_QUANTITY) {
        Alert.alert("Could not add item", QUANTITY_MESSAGE);
        return;
      }
      const next = existing
        ? items.map((i) =>
            i.productId === product.id
              ? {
                  ...i,
                  quantity: Math.min(
                    nextQuantity,
                    product.stockQuantity,
                    MAX_QUANTITY,
                  ),
                }
              : i,
          )
        : [
            ...items,
            {
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              quantity: Math.min(
                quantity,
                product.stockQuantity,
                MAX_QUANTITY,
              ),
              thumbnailUrl: product.thumbnailUrl,
              maxStock: Math.min(product.stockQuantity, MAX_QUANTITY),
            },
          ];
      await saveGuestCart(next);
    }
  }

  async function updateQuantity(productId: number, quantity: number) {
    if (busy.current) return;
    busy.current = true;
    try {
      if (user) {
        const cart =
          quantity <= 0
            ? await cartApi.removeItem(productId)
            : await cartApi.setQuantity(productId, quantity);
        setItems(fromServerCart(cart.items));
      } else {
        const next =
          quantity <= 0
            ? items.filter((i) => i.productId !== productId)
            : items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: Math.min(quantity, i.maxStock) }
                  : i,
              );
        await saveGuestCart(next);
      }
    } catch (err) {
      showApiError(err, "Could not update quantity");
    } finally {
      busy.current = false;
    }
  }

  async function removeItem(productId: number) {
    await updateQuantity(productId, 0);
  }

  async function clear() {
    if (user)
      setItems([]); // the server already clears its cart after a successful checkout
    else await saveGuestCart([]);
  }

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        total,
        isGuest,
        refresh,
        addItem,
        updateQuantity,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
