import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { track } from "@/utils/amplitude";
import beautyPass from "@/assets/beauty-pass.jpg";
import pSerum from "@/assets/p-serum.jpg";
import pPerfume from "@/assets/p-perfume.jpg";
import pCream from "@/assets/p-cream.jpg";

export const Route = createFileRoute("/rewards-boutique")({
  head: () => ({
    meta: [
      { title: "Rewards Boutique — Beauty Retail Demo" },
      { name: "description", content: "Redeem Beauty Pass points for discounts, deluxe samples and birthday gifts." },
      { property: "og:title", content: "Rewards Boutique — Beauty Retail Demo" },
      { property: "og:description", content: "Turn your Beauty Pass points into rewards." },
    ],
  }),
  component: RewardsPage,
});

const rewards = [
  { type: "Points Discount", title: "$10 off your bag", cost: 500, image: pCream, alt: "White moisturiser jar" },
  { type: "Free Sample", title: "Deluxe serum sample", cost: 250, image: pSerum, alt: "Amber serum bottle" },
  { type: "Birthday Gift", title: "Birthday fragrance duo", cost: 0, image: pPerfume, alt: "Pink perfume bottle" },
] as const;

function RewardsPage() {
  const { points, tier, appliedReward, applyReward } = useStore();

  return (
    <div className="container-x py-12">
      <div className="relative">
        <img src={beautyPass} alt="White, black and gold membership cards" width={1400} height={700} className="h-52 w-full object-cover" />
        <div className="absolute inset-0 flex items-center bg-primary/55">
          <div className="px-8 text-primary-foreground">
            <h1 className="text-3xl font-black uppercase tracking-[0.1em]">Rewards Boutique</h1>
            <p className="mt-2 text-sm">{tier} Pass · {points} points available</p>
          </div>
        </div>
      </div>

      {appliedReward && (
        <p className="mt-6 rounded-sm bg-secondary p-4 text-sm">Applied to your bag: <strong>{appliedReward}</strong></p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {rewards.map((r) => (
          <div key={r.title} className="border border-border">
            <img src={r.image} alt={r.alt} width={800} height={800} loading="lazy" className="aspect-square w-full object-cover" />
            <div className="p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sephora-red">{r.type}</p>
              <h2 className="mt-2 text-lg font-bold">{r.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{r.cost ? `${r.cost} points` : "Free for members"}</p>
              <button
                onClick={() => {
                  applyReward(r.title, r.cost);
                  track("Apply Points Reward", { "Reward Type": r.type, "Beauty Pass Tier": tier });
                  toast.success(`${r.title} applied to your bag`);
                }}
                className="mt-4 w-full rounded-sm bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                Apply reward
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <Link to="/cart" className="rounded-sm border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest">Back to bag</Link>
        <Link to="/checkout" className="rounded-sm bg-sephora-red px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">Continue to checkout</Link>
      </div>
    </div>
  );
}