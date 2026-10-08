import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  variant?: string;
  qty: number;
};

type Store = {
  cart: CartItem[];
  wishlist: string[];
  recent: string[];
  addToCart: (item: CartItem) => void;
  updateQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  addRecent: (id: string) => void;
};

export const itemKey = (i: { productId: string; variant?: string }) => `${i.productId}::${i.variant ?? ""}`;

const Ctx = createContext<Store | null>(null);

function useLocal<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, [key]);
  useEffect(() => {
    if (loaded) localStorage.setItem(key, JSON.stringify(v));
  }, [key, v, loaded]);
  return [v, setV] as const;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useLocal<CartItem[]>("ag-cart", []);
  const [wishlist, setWish] = useLocal<string[]>("ag-wish", []);
  const [recent, setRecent] = useLocal<string[]>("ag-recent", []);

  const value: Store = {
    cart,
    wishlist,
    recent,
    addToCart: (item) =>
      setCart((c) => {
        const k = itemKey(item);
        const ex = c.find((i) => itemKey(i) === k);
        if (ex) return c.map((i) => (itemKey(i) === k ? { ...i, qty: Math.min(i.qty + item.qty, 20) } : i));
        return [...c, item];
      }),
    updateQty: (k, qty) => setCart((c) => c.map((i) => (itemKey(i) === k ? { ...i, qty: Math.max(1, Math.min(qty, 20)) } : i))),
    removeFromCart: (k) => setCart((c) => c.filter((i) => itemKey(i) !== k)),
    clearCart: () => setCart([]),
    toggleWishlist: (id) => setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
    addRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 10)),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

export const inr = (n: number) => "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
