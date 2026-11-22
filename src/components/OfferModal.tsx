import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Link } from "@tanstack/react-router";

const copy: Record<string, { title: string; body: string; cta: string; to: string }> = {
  "App Reward": {
    title: "App Fest: 15% off your first app order",
    body: "Download the Beauty Retail app and unlock an extra 15% off, plus 2x Beauty Pass points this week.",
    cta: "Shop App Fest",
    to: "/categories/makeup",
  },
  "New Arrival": {
    title: "Just landed: Rose Atlas Eau de Parfum",
    body: "Damask rose, lychee and cedar — app-exclusive early access before it hits stores.",
    cta: "See the launch",
    to: "/products/rose-atlas-edp",
  },
  Survey: {
    title: "60-second beauty survey",
    body: "Tell us what you're shopping for and get 100 bonus Beauty Pass points.",
    cta: "Go to Rewards Boutique",
    to: "/rewards-boutique",
  },
  Feedback: {
    title: "How was your last order?",
    body: "Share quick feedback and we'll add a free sample to your next bag.",
    cta: "Leave a review",
    to: "/products/glow-vitamin-c-serum",
  },
};

export function OfferModal() {
  const { offer, closeOffer } = useStore();
  if (!offer) return null;
  const c = copy[offer];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={c.title}
      onClick={closeOffer}
    >
      <div
        className="relative w-full max-w-md rounded-sm bg-background p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeOffer}
          aria-label="Dismiss offer"
          className="absolute right-3 top-3 p-2 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sephora-red">
          App-Exclusive · {offer}
        </p>
        <h2 className="mt-3 text-2xl font-bold leading-tight">{c.title}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
        <div className="mt-6 flex gap-3">
          <Link
            to={c.to}
            onClick={closeOffer}
            className="rounded-sm bg-sephora-red px-5 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
          >
            {c.cta}
          </Link>
          <button
            onClick={closeOffer}
            className="rounded-sm border border-border px-5 py-3 text-xs font-semibold uppercase tracking-widest"
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}