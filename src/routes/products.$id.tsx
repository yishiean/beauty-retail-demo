import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { productById, products, freeSamples } from "@/lib/data";
import { useStore } from "@/lib/store";
import { track } from "@/utils/amplitude";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const product = productById(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product unavailable — Beauty Retail Demo" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    return {
      meta: [
        { title: `${p.name} — Beauty Retail Demo` },
        { name: "description", content: `${p.blurb} $${p.price} SGD. Free samples with every order.` },
        { property: "og:title", content: `${p.name} by ${p.brand}` },
        { property: "og:description", content: p.blurb },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const { addToBag, toggleWishlist, wishlist, tier, samples, setSamples, addNotification, openOffer } = useStore();
  const [shade, setShade] = useState(product.shades?.[0]);
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [alertSet, setAlertSet] = useState(false);
  const saved = !!wishlist.find((w) => w.id === product.id);

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
    toast.success(`${chosen.length} free sample(s) added to your bag`);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (review.trim().length < 5) {
      toast.error("Write a few more words about the product");
      return;
    }
    const len = review.length < 60 ? "Short" : review.length < 200 ? "Medium" : "Detailed";
    track("Write Product Review", { "Star Rating": `${stars} Stars`, "Review Length": len });
    setReviewed(true);
    toast.success("Thanks! Your review is live.");
  };

  const notifyMe = () => {
    setAlertSet(true);
    addNotification({
      title: `${product.name} is back in stock`,
      body: "Limited units at ION Orchard and online. Tap to shop before it sells out again.",
      channel: "Push",
    });
    track("Receive Back-in-Stock Alert", { "Alert Channel": "Push", "Beauty Pass Tier": tier });
    toast.success("We'll alert you the moment it's back — check your Notification Centre");
  };

  return (
    <div className="container-x py-10">
      <nav className="text-xs uppercase tracking-widest text-muted-foreground">
        <Link to="/" className="hover:text-sephora-red">Home</Link> /{" "}
        <Link to="/categories/$slug" params={{ slug: product.category }} className="hover:text-sephora-red">
          {product.category}
        </Link>{" "}
        / {product.name}
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <img
          src={product.image}
          alt={product.alt}
          width={800}
          height={800}
          className="w-full bg-secondary object-cover"
        />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-black">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">★ {product.rating} · {product.reviews} reviews</p>
          <p className="mt-4 text-2xl font-semibold">${product.price.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">or 3 payments of ${(product.price / 3).toFixed(2)} with Atome</p>
          <p className="mt-4 text-sm">{product.blurb}</p>

          {product.shades ? (
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Shade: {shade}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.shades.map((s: string) => (
                  <button
                    key={s}
                    onClick={() => setShade(s)}
                    className={`rounded-full border px-4 py-2 text-xs ${
                      s === shade ? "border-sephora-red text-sephora-red" : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {product.inStock ? (
              <button
                onClick={() => {
                  addToBag(product, shade);
                  track("Add to Bag", { Category: product.eventCategory, "Beauty Pass Tier": tier });
                  toast.success("Added to bag");
                  navigate({ to: "/cart" });
                }}
                className="rounded-sm bg-primary px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                Add to Bag
              </button>
            ) : (
              <button
                onClick={notifyMe}
                disabled={alertSet}
                className="rounded-sm bg-sephora-red px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
              >
                {alertSet ? "Alert set" : "Notify me when back in stock"}
              </button>
            )}
            <button
              onClick={() => {
                toggleWishlist(product);
                if (!saved) {
                  track("Add to Wish List", { Category: product.eventCategory, "Beauty Pass Tier": tier });
                  toast.success("Saved to your Wish List");
                }
              }}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3.5 text-xs font-semibold uppercase tracking-widest"
            >
              <Heart className={saved ? "size-4 fill-sephora-red text-sephora-red" : "size-4"} />
              {saved ? "Saved" : "Add to Wish List"}
            </button>
          </div>

          <div className="mt-8 border border-border p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">Choose free samples</p>
            <p className="mt-1 text-xs text-muted-foreground">Beauty Pass members get up to 3 samples per order.</p>
            <div className="mt-4 space-y-2">
              {freeSamples.map((s) => (
                <label key={s.id} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={samples.includes(s.id)}
                    onChange={() => toggleSample(s.id)}
                    className="size-4 accent-[var(--sephora-red)]"
                  />
                  {s.name} <span className="text-xs text-muted-foreground">({s.category})</span>
                </label>
              ))}
            </div>
            <button
              onClick={confirmSamples}
              className="mt-4 rounded-sm border border-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-widest"
            >
              Add free samples
            </button>
          </div>

          <button
            onClick={() => openOffer("New Arrival")}
            className="mt-6 text-xs font-semibold uppercase tracking-widest text-sephora-red"
          >
            See app-exclusive launch offer
          </button>
        </div>
      </div>

      <section className="mt-16 max-w-2xl">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Write a review</h2>
        {reviewed ? (
          <p className="mt-4 rounded-sm bg-secondary p-4 text-sm">Your {stars}-star review has been published. Thank you!</p>
        ) : (
          <form onSubmit={submitReview} className="mt-4">
            <div className="flex gap-2">
              {[5, 4, 3].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  className={`rounded-sm border px-4 py-2 text-sm ${
                    s === stars ? "border-sephora-red text-sephora-red" : "border-border"
                  }`}
                >
                  {s} Stars
                </button>
              ))}
            </div>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              aria-label="Your review"
              placeholder="How did it wear in Singapore humidity?"
              className="mt-4 w-full rounded-sm border border-border p-3 text-sm outline-none focus:border-sephora-red"
            />
            <button className="mt-3 rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
              Submit review
            </button>
          </form>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">You may also like</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.filter((p) => p.id !== product.id).slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}