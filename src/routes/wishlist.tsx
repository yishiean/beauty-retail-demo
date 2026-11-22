import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { track } from "@/utils/amplitude";
import emptyBag from "@/assets/empty-bag.png";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wish List — Beauty Retail Demo" },
      { name: "description", content: "Save your beauty favourites and move them into your bag when you're ready." },
      { property: "og:title", content: "Wish List — Beauty Retail Demo" },
      { property: "og:description", content: "Your saved beauty favourites." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, toggleWishlist, addToBag, tier } = useStore();

  if (!wishlist.length) {
    return (
      <div className="container-x flex flex-col items-center py-20 text-center">
        <img src={emptyBag} alt="Illustration of an empty shopping bag" width={700} height={700} loading="lazy" className="w-56" />
        <h1 className="mt-6 text-2xl font-black">No favourites yet</h1>
        <Link to="/categories/$slug" params={{ slug: "fragrance" }} className="mt-6 rounded-sm bg-sephora-red px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
          Explore fragrance
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-black">Wish List ({wishlist.length})</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.map((p) => (
          <div key={p.id} className="border border-border">
            <Link to="/products/$id" params={{ id: p.id }}>
              <img src={p.image} alt={p.alt} width={800} height={800} loading="lazy" className="aspect-square w-full object-cover" />
            </Link>
            <div className="p-5">
              <p className="text-[11px] font-bold uppercase tracking-widest">{p.brand}</p>
              <p className="mt-1 text-sm">{p.name}</p>
              <p className="mt-2 text-sm font-semibold">${p.price.toFixed(2)}</p>
              <button
                onClick={() => {
                  addToBag(p);
                  track("Add to Bag", {
                    Category: p.eventCategory,
                    "Product Name": p.name,
                    "Beauty Pass Tier": tier,
                    "Purchase Type": "First Purchase",
                  });
                  toast.success(`${p.name} added to bag`);
                }}
                className="mt-4 w-full rounded-sm bg-sephora-red px-4 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                Add to bag
              </button>
              <button onClick={() => toggleWishlist(p)} className="mt-2 w-full text-xs uppercase tracking-widest text-muted-foreground">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}