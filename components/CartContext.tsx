"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  nameAr: string;
  price: string;
  imageUrl: string;
  quantity: number;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "stock" | "nameAr"> & { stock?: number; nameAr?: string }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  hydrated: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const saved = localStorage.getItem("atugusto-cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrate old items without stock/nameAr fields
        setItems(parsed.map((i: Record<string, unknown>) => ({ ...i, stock: (i.stock as number) ?? 999, nameAr: (i.nameAr as string) ?? "" })));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("atugusto-cart", JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((newItem: Omit<CartItem, "quantity" | "stock" | "nameAr"> & { stock?: number; nameAr?: string }) => {
    const stock = newItem.stock ?? 999;
    const nameAr = newItem.nameAr ?? "";
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === newItem.productId);
      if (existing) {
        const newQty = Math.min(existing.quantity + 1, stock);
        return prev.map((i) =>
          i.productId === newItem.productId ? { ...i, quantity: newQty, stock, nameAr } : i
        );
      }
      return [...prev, { ...newItem, nameAr, quantity: 1, stock }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stock || 999) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, hydrated }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
