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
import { useAuth } from "../../auth/context/AuthContext";
import { Product } from "../../catalog/types";
import { cartApi } from "../api/cartApi";

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
  }[],
): CartLine[] {
  return items.map((i) => ({ ...i, thumbnailUrl: null, maxStock: 9999 }));
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
      const cart = await cartApi.addItem(product.id, quantity);
      setItems(fromServerCart(cart.items));
    } else {
      const existing = items.find((i) => i.productId === product.id);
      const next = existing
        ? items.map((i) =>
            i.productId === product.id
              ? {
                  ...i,
                  quantity: Math.min(
                    i.quantity + quantity,
                    product.stockQuantity,
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
              quantity: Math.min(quantity, product.stockQuantity),
              thumbnailUrl: product.thumbnailUrl,
              maxStock: product.stockQuantity,
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
