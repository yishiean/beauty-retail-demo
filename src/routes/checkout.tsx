import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { setGroup, track } from "@/utils/amplitude";
import { freeSamples } from "@/lib/data";
import emptyBag from "@/assets/empty-bag.png";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Beauty Retail Demo" },
      { name: "description", content: "Choose Standard, Express or Click & Collect and pay by card, Atome or PayPal." },
      { property: "og:title", content: "Checkout — Beauty Retail Demo" },
      { property: "og:description", content: "Fast SG delivery, Click & Collect and Atome instalments." },
    ],
  }),
  component: CheckoutPage,
});

const fulfilments = ["Standard", "Express", "Click & Collect"] as const;
const payments = ["Card", "Atome", "PayPal"] as const;

function CheckoutPage() {
  const navigate = useNavigate();
  const { bag, bagValue, samples, tier, appliedReward, clearBag, setLastOrder, openOffer } = useStore();
  const [fulfilment, setFulfilment] = useState<(typeof fulfilments)[number]>("Standard");
  const [payment, setPayment] = useState<(typeof payments)[number]>("Card");
  const [placing, setPlacing] = useState(false);

  const shipping = fulfilment === "Express" ? 9.9 : fulfilment === "Click & Collect" ? 0 : bagValue >= 35 ? 0 : 4.9;
  const discount = appliedReward === "$10 off your bag" ? 10 : 0;
  const total = Math.max(0, bagValue + shipping - discount);

  if (!bag.length) {
    return (
      <div className="container-x flex flex-col items-center py-20 text-center">
        <img src={emptyBag} alt="Illustration of an empty shopping bag" width={700} height={700} loading="lazy" className="w-56" />
        <h1 className="mt-6 text-2xl font-black">Nothing to check out yet</h1>
        <Link to="/categories/$slug" params={{ slug: "skincare" }} className="mt-6 rounded-sm bg-sephora-red px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
          Shop skincare
        </Link>
      </div>
    );
  }

  const placeOrder = () => {
    setPlacing(true);
    const orderId = `SG-${Math.floor(100000 + Math.random() * 899999)}`;
    setGroup("Opportunity Id", orderId);
    track("Complete Checkout", {
      Category: bag[0].product.eventCategory,
      "Beauty Pass Tier": tier,
      "Fulfilment Method": fulfilment,
      "Payment Method": payment,
    });
    setLastOrder({ id: orderId, fulfilment, payment, lines: bag });
    setTimeout(() => {
      clearBag();
      setPlacing(false);
      toast.success(`Order ${orderId} confirmed`);
      navigate({ to: "/order-confirmation" });
    }, 700);
  };

  const box = "rounded-sm border px-4 py-3 text-sm";

  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="text-3xl font-black">Checkout</h1>

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Delivery</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {fulfilments.map((f) => (
              <button
                key={f}
                onClick={() => setFulfilment(f)}
                className={`${box} text-left ${f === fulfilment ? "border-sephora-red" : "border-border"}`}
              >
                <span className="block font-semibold">{f}</span>
                <span className="text-xs text-muted-foreground">
                  {f === "Standard" ? "2-4 days · free above $35" : f === "Express" ? "Next day · $9.90" : "Collect at ION Orchard"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Delivery address</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input aria-label="Full name" placeholder="Full name" className="rounded-sm border border-border px-3 py-2.5 text-sm" defaultValue="Wei Ling Tan" />
            <input aria-label="Mobile" placeholder="Mobile" className="rounded-sm border border-border px-3 py-2.5 text-sm" defaultValue="+65 8123 4567" />
            <input aria-label="Address" placeholder="Address" className="rounded-sm border border-border px-3 py-2.5 text-sm sm:col-span-2" defaultValue="2 Orchard Turn, #B2-01" />
            <input aria-label="Postal code" placeholder="Postal code" className="rounded-sm border border-border px-3 py-2.5 text-sm" defaultValue="238801" />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Payment</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {payments.map((p) => (
              <button key={p} onClick={() => setPayment(p)} className={`${box} ${p === payment ? "border-sephora-red" : "border-border"}`}>
                <span className="block font-semibold">{p}</span>
                <span className="text-xs text-muted-foreground">
                  {p === "Atome" ? `3 × $${(total / 3).toFixed(2)}` : p === "PayPal" ? "Redirect at payment" : "Visa / Amex / Mastercard"}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 border border-border p-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Free samples</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {samples.length
              ? freeSamples.filter((s) => samples.includes(s.id)).map((s) => s.name).join(", ")
              : "No samples chosen yet."}
          </p>
          <Link to="/cart" className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest text-sephora-red">
            Edit samples in bag
          </Link>
        </section>
      </div>

      <aside className="h-fit border border-border p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Summary</h2>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>${bagValue.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping ? `$${shipping.toFixed(2)}` : "Free"}</dd></div>
          {discount > 0 && <div className="flex justify-between text-sephora-red"><dt>Points reward</dt><dd>-${discount.toFixed(2)}</dd></div>}
          <div className="flex justify-between text-base font-semibold"><dt>Total (SGD)</dt><dd>${total.toFixed(2)}</dd></div>
        </dl>
        <button
          onClick={placeOrder}
          disabled={placing}
          className="mt-6 w-full rounded-sm bg-sephora-red px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
        >
          {placing ? "Placing order…" : "Place order"}
        </button>
        <button onClick={() => openOffer("Survey")} className="mt-4 w-full text-xs font-semibold uppercase tracking-widest text-sephora-red">
          Get 100 bonus points
        </button>
      </aside>
    </div>
  );
}