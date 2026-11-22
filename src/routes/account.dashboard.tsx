import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { track } from "@/utils/amplitude";
import beautyPass from "@/assets/beauty-pass.jpg";

export const Route = createFileRoute("/account/dashboard")({
  head: () => ({
    meta: [
      { title: "My Beauty Pass — Beauty Retail Demo" },
      { name: "description", content: "Your Beauty Pass tier, points balance, orders and beauty preferences." },
      { property: "og:title", content: "My Beauty Pass — Beauty Retail Demo" },
      { property: "og:description", content: "Tier status, points and order history." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, tier, points, lastOrder, variant, wishlist, bag } = useStore();

  return (
    <div className="container-x py-12">
      <div className="relative">
        <img src={beautyPass} alt="White, black and gold Beauty Pass membership cards" width={1400} height={700} className="h-56 w-full object-cover" />
        <div className="absolute inset-0 flex items-center bg-primary/55 px-8 text-primary-foreground">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em]">{tier} Beauty Pass</p>
            <h1 className="mt-2 text-3xl font-black">{user?.name ?? "Guest Beauty"}</h1>
            <p className="mt-1 text-sm">{user?.email ?? "Join to start earning points"} · {points} points</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          { label: "Points balance", value: `${points}` },
          { label: "Items in bag", value: `${bag.length}` },
          { label: "Wish list", value: `${wishlist.length}` },
        ].map((s) => (
          <div key={s.label} className="border border-border p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-3xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 border border-border p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Recent order</h2>
        {lastOrder ? (
          <div className="mt-4 text-sm">
            <p className="font-semibold">{lastOrder.id}</p>
            <p className="text-muted-foreground">{lastOrder.fulfilment} · {lastOrder.payment} · {lastOrder.lines.length} item(s)</p>
            <Link to="/order-confirmation" className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest text-sephora-red">
              View confirmation
            </Link>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No orders yet in this session.</p>
        )}
      </section>

      <section className="mt-8 flex flex-wrap gap-3">
        <Link to="/preferences" className="rounded-sm border border-border px-5 py-3 text-xs font-semibold uppercase tracking-widest">
          Update beauty preferences
        </Link>
        <Link to="/rewards-boutique" className="rounded-sm border border-border px-5 py-3 text-xs font-semibold uppercase tracking-widest">
          Rewards Boutique
        </Link>
        <button
          onClick={() => {
            track("Contact Beauty Advisor", { "Contact Channel": "Live Chat", "Beauty Pass Tier": tier });
            toast.success("A Beauty Advisor has joined the chat");
          }}
          className="rounded-sm bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
        >
          Chat with a Beauty Advisor
        </button>
      </section>

      <p className="mt-8 text-xs uppercase tracking-widest text-muted-foreground">
        Experiment cohort: {variant}
      </p>
    </div>
  );
}