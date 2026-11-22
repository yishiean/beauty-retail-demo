import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { bagValueBucket, useStore } from "@/lib/store";
import { track } from "@/utils/amplitude";
import { freeSamples } from "@/lib/data";
import emptyBag from "@/assets/empty-bag.png";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — Beauty Retail Demo" },
      { name: "description", content: "Review your beauty bag, add free samples and unlock free shipping above $35." },
      { property: "og:title", content: "Your Shopping Bag — Beauty Retail Demo" },
      { property: "og:description", content: "Free samples, Atome instalments and free shipping above $35." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { bag, removeFromBag, bagValue, samples, setSamples, openOffer } = useStore();
  const [reason, setReason] = useState("Shipping Cost");
  const checkingOut = useRef(false);
  const state = useRef({ bagValue, bagLen: bag.length, reason });
  state.current = { bagValue, bagLen: bag.length, reason };

  useEffect(() => {
    const unsub = router.subscribe("onBeforeNavigate", (evt) => {
      const to = evt.toLocation.pathname;
      if (to === "/cart" || checkingOut.current) return;
      if (to === "/checkout") return;
      if (state.current.bagLen === 0) return;
      track("Abandon Bag", {
        "Abandon Reason": state.current.reason,
        "Bag Value": bagValueBucket(state.current.bagValue),
      });
    });
    return unsub;
  }, [router]);

  const toggleSample = (id: string) =>
    setSamples(samples.includes(id) ? samples.filter((s) => s !== id) : [...samples, id]);

  const confirmSamples = () => {
    if (!samples.length) {
      toast.error("Pick at least one free sample");
      return;
    }
    const chosen = freeSamples.filter((s) => samples.includes(s.id));
    track("Choose Free Samples", {
      "Sample Category": chosen[0].category,
      "Sample Count": `${chosen.length} Sample${chosen.length > 1 ? "s" : ""}`,
    });
    toast.success("Free samples added");
  };

  const shippingLeft = Math.max(0, 35 - bagValue);

  if (!bag.length) {
    return (
      <div className="container-x flex flex-col items-center py-20 text-center">
        <img src={emptyBag} alt="Illustration of an empty shopping bag with a pink heart" width={700} height={700} loading="lazy" className="w-64" />
        <h1 className="mt-6 text-2xl font-black">Your bag is feeling light</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Add a hero product and we'll throw in free samples. Free shipping above $35.
        </p>
        <Link to="/categories/$slug" params={{ slug: "makeup" }} className="mt-6 rounded-sm bg-sephora-red px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
      <div>
        <h1 className="text-3xl font-black">Shopping Bag ({bag.length})</h1>
        <div className="mt-4 rounded-sm bg-secondary p-4 text-sm">
          {shippingLeft > 0
            ? `Spend $${shippingLeft.toFixed(2)} more for free standard shipping.`
            : "You've unlocked free standard shipping."}
        </div>

        <ul className="mt-6 divide-y divide-border border-y border-border">
          {bag.map((l) => (
            <li key={l.product.id + (l.shade ?? "")} className="flex gap-4 py-5">
              <img src={l.product.image} alt={l.product.alt} width={800} height={800} loading="lazy" className="size-24 object-cover" />
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-widest">{l.product.brand}</p>
                <Link to="/products/$id" params={{ id: l.product.id }} className="text-sm hover:underline">
                  {l.product.name}
                </Link>
                {l.shade && <p className="text-xs text-muted-foreground">Shade: {l.shade}</p>}
                <p className="mt-1 text-xs text-muted-foreground">Qty {l.qty}</p>
                <button onClick={() => removeFromBag(l.product.id)} className="mt-2 text-xs uppercase tracking-widest text-sephora-red">
                  Remove
                </button>
              </div>
              <p className="text-sm font-semibold">${(l.product.price * l.qty).toFixed(2)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 border border-border p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Choose your free samples</p>
          <div className="mt-4 space-y-2">
            {freeSamples.map((s) => (
              <label key={s.id} className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={samples.includes(s.id)} onChange={() => toggleSample(s.id)} className="size-4 accent-[var(--sephora-red)]" />
                {s.name} <span className="text-xs text-muted-foreground">({s.category})</span>
              </label>
            ))}
          </div>
          <button onClick={confirmSamples} className="mt-4 rounded-sm border border-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest">
            Add free samples
          </button>
        </div>
      </div>

      <aside className="h-fit border border-border p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Order summary</h2>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>${bagValue.toFixed(2)}</dd></div>
          <div className="flex justify-between"><dt>Shipping</dt><dd>{bagValue >= 35 ? "Free" : "$4.90"}</dd></div>
          <div className="flex justify-between font-semibold"><dt>Total (SGD)</dt><dd>${(bagValue + (bagValue >= 35 ? 0 : 4.9)).toFixed(2)}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">or 3 × ${((bagValue + (bagValue >= 35 ? 0 : 4.9)) / 3).toFixed(2)} with Atome</p>

        <button
          onClick={() => {
            checkingOut.current = true;
            navigate({ to: "/checkout" });
          }}
          className="mt-6 w-full rounded-sm bg-sephora-red px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
        >
          Checkout
        </button>
        <Link to="/rewards-boutique" className="mt-3 block w-full rounded-sm border border-border px-6 py-3.5 text-center text-xs font-semibold uppercase tracking-widest">
          Apply points reward
        </Link>
        <button onClick={() => openOffer("App Reward")} className="mt-4 w-full text-xs font-semibold uppercase tracking-widest text-sephora-red">
          View App Fest offer
        </button>

        <label className="mt-6 block text-[11px] font-bold uppercase tracking-widest">
          If you leave, why? (demo)
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-2 w-full rounded-sm border border-border px-3 py-2 text-sm font-normal normal-case tracking-normal">
            {["Shipping Cost", "Price", "Changed Mind"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
      </aside>
    </div>
  );
}