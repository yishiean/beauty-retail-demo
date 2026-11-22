import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { track } from "@/utils/amplitude";
import { products } from "@/lib/data";
import serviceMakeover from "@/assets/service-makeover.jpg";

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Beauty Retail Demo" },
      { name: "description", content: "Your beauty order is confirmed. Reorder your favourites in one tap." },
      { property: "og:title", content: "Order Confirmed — Beauty Retail Demo" },
      { property: "og:description", content: "Track your order and reorder favourites." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { lastOrder, tier, addToBag } = useStore();
  const favourites = (lastOrder?.lines.map((l) => l.product) ?? products.slice(0, 3)).slice(0, 3);

  return (
    <div className="container-x py-14">
      <div className="border border-border p-8 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sephora-red">Order confirmed</p>
        <h1 className="mt-3 text-3xl font-black">Thank you, beauty.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Order <strong>{lastOrder?.id ?? "SG-000000"}</strong> · {lastOrder?.fulfilment ?? "Standard"} ·{" "}
          {lastOrder?.payment ?? "Card"} · Free samples included
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/account/dashboard" className="rounded-sm border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest">
            View order history
          </Link>
          <Link to="/beauty-services" className="rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
            Book a beauty service
          </Link>
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Reorder your favourites</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {favourites.map((p) => (
            <div key={p.id} className="border border-border">
              <img src={p.image} alt={p.alt} width={800} height={800} loading="lazy" className="aspect-square w-full object-cover" />
              <div className="p-5">
                <p className="text-[11px] font-bold uppercase tracking-widest">{p.brand}</p>
                <p className="mt-1 text-sm">{p.name}</p>
                <p className="mt-2 text-sm font-semibold">${p.price.toFixed(2)}</p>
                <button
                  onClick={() => {
                    addToBag(p);
                    track("Reorder Favourite", {
                      Category: p.eventCategory,
                      "Beauty Pass Tier": tier,
                      "Fulfilment Method": lastOrder?.fulfilment ?? "Standard",
                      "Purchase Type": "Replenishment",
                    });
                    toast.success(`${p.name} added to your bag again`);
                  }}
                  className="mt-4 w-full rounded-sm bg-sephora-red px-4 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
                >
                  Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 grid items-center gap-8 border border-border md:grid-cols-2">
        <img src={serviceMakeover} alt="Makeup artist applying makeup to a client" width={1000} height={700} loading="lazy" className="h-full w-full object-cover" />
        <div className="p-8">
          <h2 className="text-2xl font-bold">Make it a beauty date</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Members get a complimentary 30-minute makeover with any order above $100.
          </p>
          <Link to="/beauty-classes" className="mt-5 inline-block text-xs font-semibold uppercase tracking-widest text-sephora-red">
            Browse beauty classes
          </Link>
        </div>
      </section>
    </div>
  );
}