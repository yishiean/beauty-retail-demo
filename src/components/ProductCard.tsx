import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { track } from "@/utils/amplitude";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/data";

export function ProductCard({ product }: { product: Product }) {
  const { addToBag, toggleWishlist, wishlist, tier } = useStore();
  const saved = !!wishlist.find((w) => w.id === product.id);

  return (
    <div className="group relative flex flex-col border border-border bg-background">
      <button
        aria-label={saved ? "Remove from wish list" : "Add to wish list"}
        onClick={() => {
          toggleWishlist(product);
          if (!saved) {
            track("Add to Wish List", {
              Category: product.eventCategory,
              "Beauty Pass Tier": tier,
            });
            toast.success(`${product.name} added to your Wish List`);
          }
        }}
        className="absolute right-2 top-2 z-10 rounded-full bg-background/90 p-2"
      >
        <Heart className={saved ? "size-4 fill-sephora-red text-sephora-red" : "size-4"} />
      </button>
      <Link to="/products/$id" params={{ id: product.id }} className="block overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.alt}
          width={800}
          height={800}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em]">{product.brand}</p>
        <Link to="/products/$id" params={{ id: product.id }} className="mt-1 text-sm hover:underline">
          {product.name}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">
          ★ {product.rating} ({product.reviews})
        </p>
        <p className="mt-2 text-sm font-semibold">${product.price.toFixed(2)}</p>
        {!product.inStock && (
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-sephora-red">
            Out of stock
          </p>
        )}
        <button
          disabled={!product.inStock}
          onClick={() => {
            addToBag(product);
            track("Add to Bag", {
              Category: product.eventCategory,
              "Beauty Pass Tier": tier,
            });
            toast.success(`${product.name} added to your bag`);
          }}
          className="mt-4 rounded-sm bg-primary px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          {product.inStock ? "Add to Bag" : "Sold out"}
        </button>
      </div>
    </div>
  );
}