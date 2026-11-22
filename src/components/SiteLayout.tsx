import { Link, useRouterState, type LinkProps } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Heart, Search, ShoppingBag, Bell, User, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { track, initAmplitude } from "@/utils/amplitude";
import { OfferModal } from "./OfferModal";
import { AgentChat } from "./AgentChat";
import { categories } from "@/lib/data";

const navLinks: { path: string; link: LinkProps; label: string }[] = [
  { path: "/categories/makeup", link: { to: "/categories/$slug", params: { slug: "makeup" } }, label: "Makeup" },
  { path: "/categories/skincare", link: { to: "/categories/$slug", params: { slug: "skincare" } }, label: "Skincare" },
  { path: "/categories/hair", link: { to: "/categories/$slug", params: { slug: "hair" } }, label: "Hair" },
  { path: "/categories/fragrance", link: { to: "/categories/$slug", params: { slug: "fragrance" } }, label: "Fragrance" },
  { path: "/categories/bath-body", link: { to: "/categories/$slug", params: { slug: "bath-body" } }, label: "Bath & Body" },
  { path: "/categories/tools-brushes", link: { to: "/categories/$slug", params: { slug: "tools-brushes" } }, label: "Tools" },
  { path: "/beauty-services", link: { to: "/beauty-services" }, label: "Services" },
  { path: "/beauty-classes", link: { to: "/beauty-classes" }, label: "Classes" },
  { path: "/rewards-boutique", link: { to: "/rewards-boutique" }, label: "Rewards" },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const { bag, wishlist, tier, user, notifications } = useStore();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;
  const [chatOpen, setChatOpen] = useState(false);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    initAmplitude();
  }, []);

  useEffect(() => {
    try {
      setGlow(localStorage.getItem("glow-mode") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleGlow = () => {
    setGlow((g) => {
      const next = !g;
      try {
        localStorage.setItem("glow-mode", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <div className={`flex min-h-screen flex-col bg-background text-foreground${glow ? " glow-mode" : ""}`}>
      <div className="bg-primary text-primary-foreground">
        <div className="container-x flex h-9 items-center gap-6 text-[11px] tracking-[0.18em] uppercase">
          <span className="ml-auto">Free shipping above $35</span>
          <span className="hidden sm:inline">Pay in 3 with Atome</span>
          <span className="hidden md:inline">App Fest · 15% off your first app order</span>
          <button
            type="button"
            onClick={toggleGlow}
            aria-pressed={glow}
            aria-label="Highlight clickable links"
            title="Highlight clickable links"
            className={`ml-auto relative inline-flex h-[14px] w-[26px] shrink-0 items-center rounded-full border transition-all duration-300 ${
              glow
                ? "border-gold bg-gold/25 shadow-[0_0_10px_color-mix(in_oklab,var(--gold)_70%,transparent)]"
                : "border-primary-foreground/30 bg-primary-foreground/10"
            }`}
          >
            <span
              aria-hidden="true"
              className={`block size-[9px] rounded-full transition-all duration-300 ${
                glow
                  ? "translate-x-[14px] bg-gold shadow-[0_0_8px_color-mix(in_oklab,var(--gold)_90%,transparent)]"
                  : "translate-x-[2px] bg-primary-foreground/50"
              }`}
            />
          </button>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container-x flex h-16 items-center gap-4">
          <Link to="/" className="text-lg font-black tracking-[0.25em] uppercase">
            Beauty Retail<span className="text-sephora-red"> · Demo</span>
          </Link>
          <div className="ml-auto hidden items-center gap-2 rounded-sm bg-secondary px-3 py-2 lg:flex lg:w-80">
            <Search className="size-4 text-muted-foreground" />
            <input
              aria-label="Search products"
              placeholder="Search products, brands"
              className="w-full bg-transparent text-sm outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") track("Contact Beauty Advisor");
              }}
            />
          </div>
          <nav className="ml-auto flex items-center gap-3 lg:ml-4">
            <Link to="/notifications" className="relative p-2" aria-label="Notifications">
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-0 top-0 rounded-full bg-sephora-red px-1 text-[10px] font-bold text-primary-foreground">
                  {unread}
                </span>
              )}
            </Link>
            <Link to="/account/dashboard" className="p-2" aria-label="Account">
              <User className="size-5" />
            </Link>
            <Link to="/wishlist" className="relative p-2" aria-label="Wish list">
              <Heart className="size-5" />
              {wishlist.length > 0 && (
                <span className="absolute right-0 top-0 rounded-full bg-sephora-red px-1 text-[10px] font-bold text-primary-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-2" aria-label="Shopping bag">
              <ShoppingBag className="size-5" />
              {bag.length > 0 && (
                <span className="absolute right-0 top-0 rounded-full bg-sephora-red px-1 text-[10px] font-bold text-primary-foreground">
                  {bag.length}
                </span>
              )}
            </Link>
            {user ? (
              <span className="hidden rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-widest sm:inline">
                {tier} Pass
              </span>
            ) : (
              <Link
                to="/sign_in"
                className="hidden rounded-sm bg-sephora-red px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground sm:inline"
              >
                Join Beauty Pass
              </Link>
            )}
          </nav>
        </div>
        <div className="border-t border-border">
          <div className="container-x flex h-11 items-center gap-5 overflow-x-auto text-[11px] font-semibold uppercase tracking-[0.16em]">
            {navLinks.map((l) => (
              <Link
                key={l.path}
                {...l.link}
                className={
                  pathname === l.path
                    ? "whitespace-nowrap text-sephora-red"
                    : "whitespace-nowrap hover:text-sephora-red"
                }
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setChatOpen((o) => !o)}
              className="whitespace-nowrap font-semibold uppercase tracking-[0.16em] hover:text-sephora-red"
            >
              Beauty Agent
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border bg-secondary">
        <div className="container-x grid gap-10 py-14 md:grid-cols-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em]">Beauty Retail · Demo</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Singapore's beauty destination. Prices in SGD. Demo site for analytics.
            </p>
            <button
              onClick={() => track("Contact Beauty Advisor")}
              className="mt-5 inline-flex items-center gap-2 rounded-sm border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest"
            >
              <MessageCircle className="size-4" /> Contact Beauty Advisor
            </button>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Shop</p>
            <ul className="mt-4 space-y-2 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to="/categories/$slug" params={{ slug: c.slug }} className="hover:text-sephora-red">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Beauty Pass</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/sign_in" className="hover:text-sephora-red">Join Beauty Pass</Link></li>
              <li><Link to="/preferences" className="hover:text-sephora-red">Beauty Preferences</Link></li>
              <li><Link to="/rewards-boutique" className="hover:text-sephora-red">Rewards Boutique</Link></li>
              <li><Link to="/account/dashboard" className="hover:text-sephora-red">My Account</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Services</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/beauty-services" className="hover:text-sephora-red">Book Beauty Services</Link></li>
              <li><Link to="/beauty-classes" className="hover:text-sephora-red">Beauty Classes</Link></li>
              <li><Link to="/stores" className="hover:text-sephora-red">Find a Store</Link></li>
              <li><Link to="/notifications" className="hover:text-sephora-red">Notification Centre</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container-x flex flex-wrap items-center justify-between gap-4 py-6 text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>© 2026 Beauty Retail Demo · Not a real store · Created by Yi Shiean</span>
            <div className="flex flex-wrap gap-2">
              {["Amex", "Visa", "Mastercard", "PayPal", "Atome", "GPay"].map((p) => (
                <span key={p} className="rounded-sm border border-border bg-background px-2 py-1 font-semibold">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <OfferModal />
      <AgentChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}