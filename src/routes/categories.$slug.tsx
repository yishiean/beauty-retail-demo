import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { categories, productsByCategory } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const cat = categories.find((c) => c.slug === params.slug);
    const name = cat?.name ?? "Shop";
    return {
      meta: [
        { title: `${name} — Beauty Retail Demo` },
        { name: "description", content: `Shop ${name.toLowerCase()} in SGD. Free shipping above $35, free samples with every order.` },
        { property: "og:title", content: `${name} — Beauty Retail Demo` },
        { property: "og:description", content: `Browse ${name.toLowerCase()} bestsellers and new arrivals.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = categories.find((c) => c.slug === slug);
  const all = productsByCategory(slug);
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(200);

  const items = all
    .filter((p) => p.price <= maxPrice)
    .sort((a, b) =>
      sort === "price-asc" ? a.price - b.price : sort === "rating" ? b.rating - a.rating : 0,
    );

  return (
    <div>
      {cat && (
        <div className="relative">
          <img src={cat.image} alt={cat.alt} width={800} height={800} className="h-56 w-full object-cover" />
          <div className="absolute inset-0 flex items-center bg-primary/50">
            <div className="container-x text-primary-foreground">
              <h1 className="text-4xl font-black uppercase tracking-[0.1em]">{cat.name}</h1>
              <p className="mt-2 text-sm">Free shipping above $35 · Pay in 3 with Atome</p>
            </div>
          </div>
        </div>
      )}

      <div className="container-x py-10">
        <nav className="text-xs uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-sephora-red">Home</Link> / {cat?.name ?? slug}
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-6 border-y border-border py-4">
          <label className="text-xs font-bold uppercase tracking-widest">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="ml-3 rounded-sm border border-border px-3 py-2 text-sm font-normal normal-case tracking-normal"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-widest">
            Max price: ${maxPrice}
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="ml-3 align-middle accent-[var(--sephora-red)]"
            />
          </label>
          <span className="ml-auto text-xs text-muted-foreground">{items.length} products</span>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="border border-border px-4 py-2 text-xs font-semibold uppercase tracking-widest hover:border-sephora-red"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}