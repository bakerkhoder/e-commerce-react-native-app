import { useCallback, useState } from "react";
import { cartApi } from "../api/cartApi";
import { Cart } from "../types";

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (productId: number, quantity: number) => {
    const updated = await cartApi.addItem(productId, quantity);
    setCart(updated);
  }, []);

  const removeItem = useCallback(async (productId: number) => {
    const updated = await cartApi.removeItem(productId);
    setCart(updated);
  }, []);

  return { cart, loading, refresh, addItem, removeItem };
}
