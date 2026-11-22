import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { track } from "@/utils/amplitude";
import type { Product } from "./data";

export type Tier = "White" | "Black" | "Gold";
export type OfferType = "App Reward" | "New Arrival" | "Survey" | "Feedback";

export type BagLine = { product: Product; qty: number; shade?: string };

export type DemoUser = {
  name: string;
  email: string;
  tier: Tier;
  variant: "Control" | "Treatment A" | "Treatment B";
  preferredCategory: string;
};

export type Noti = {
  id: string;
  title: string;
  body: string;
  channel: "In-App" | "Email" | "Push" | "SMS";
  read: boolean;
};

type Ctx = {
  user: DemoUser | null;
  setUser: (u: DemoUser) => void;
  tier: Tier;
  variant: DemoUser["variant"];
  bag: BagLine[];
  addToBag: (p: Product, shade?: string) => void;
  removeFromBag: (id: string) => void;
  bagValue: number;
  clearBag: () => void;
  wishlist: Product[];
  toggleWishlist: (p: Product) => void;
  samples: string[];
  setSamples: (ids: string[]) => void;
  points: number;
  appliedReward: string | null;
  applyReward: (label: string, cost: number) => void;
  notifications: Noti[];
  addNotification: (n: Omit<Noti, "id" | "read">) => void;
  markNotificationRead: (id: string) => void;
  offer: OfferType | null;
  openOffer: (t: OfferType) => void;
  closeOffer: () => void;
  lastOrder: { id: string; fulfilment: string; payment: string; lines: BagLine[] } | null;
  setLastOrder: (o: Ctx["lastOrder"]) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<DemoUser | null>(null);
  const [bag, setBag] = useState<BagLine[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [samples, setSamples] = useState<string[]>([]);
  const [points, setPoints] = useState(1250);
  const [appliedReward, setAppliedReward] = useState<string | null>(null);
  const [offer, setOffer] = useState<OfferType | null>(null);
  const [lastOrder, setLastOrder] = useState<Ctx["lastOrder"]>(null);
  const [notifications, setNotifications] = useState<Noti[]>([
    {
      id: "n0",
      title: "Beauty Pass points expiring",
      body: "You have 250 points expiring on 31 Aug. Redeem in the Rewards Boutique.",
      channel: "In-App",
      read: false,
    },
  ]);

  const tier = user?.tier ?? "White";
  const variant = user?.variant ?? "Control";

  const addToBag = useCallback((p: Product, shade?: string) => {
    setBag((prev) => {
      const found = prev.find((l) => l.product.id === p.id && l.shade === shade);
      if (found) return prev.map((l) => (l === found ? { ...l, qty: l.qty + 1 } : l));
      return [...prev, { product: p, qty: 1, shade }];
    });
  }, []);

  const removeFromBag = useCallback((id: string) => {
    setBag((prev) => prev.filter((l) => l.product.id !== id));
  }, []);

  const toggleWishlist = useCallback((p: Product) => {
    setWishlist((prev) =>
      prev.find((w) => w.id === p.id) ? prev.filter((w) => w.id !== p.id) : [...prev, p],
    );
  }, []);

  const bagValue = useMemo(
    () => bag.reduce((sum, l) => sum + l.product.price * l.qty, 0),
    [bag],
  );

  const value: Ctx = {
    user,
    setUser: setUserState,
    tier,
    variant,
    bag,
    addToBag,
    removeFromBag,
    bagValue,
    clearBag: () => setBag([]),
    wishlist,
    toggleWishlist,
    samples,
    setSamples,
    points,
    appliedReward,
    applyReward: (label, cost) => {
      setAppliedReward(label);
      setPoints((p) => Math.max(0, p - cost));
    },
    notifications,
    addNotification: (n) =>
      setNotifications((prev) => [{ ...n, id: `n${Date.now()}`, read: false }, ...prev]),
    markNotificationRead: (id) =>
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n))),
    offer,
    openOffer: (t) => {
      setOffer(t);
      track("View App-Exclusive Offer", { "Offer Type": t });
    },
    closeOffer: () => {
      if (offer) track("Dismiss App-Exclusive Offer", { "Offer Type": offer });
      setOffer(null);
    },
    lastOrder,
    setLastOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function bagValueBucket(v: number) {
  if (v < 50) return "Under $50";
  if (v <= 150) return "$50-$150";
  return "Over $150";
}