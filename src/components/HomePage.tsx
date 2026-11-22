import { useEffect, useState } from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { toast } from "sonner";
import { track } from "@/utils/amplitude";
import { useStore } from "@/lib/store";
import { categories, products, brands } from "@/lib/data";
import { ProductCard } from "@/components/ProductCard";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import beautyPass from "@/assets/beauty-pass.jpg";
import serviceMakeover from "@/assets/service-makeover.jpg";
import beautyClass from "@/assets/beauty-class.jpg";

const slides: {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  body: string;
  link: LinkProps;
  cta: string;
}[] = [
  {
    image: hero1,
    alt: "Red lipsticks, gold compacts and rose petals on a black background",
    kicker: "App Fest",
    title: "15% off your first app order",
    body: "Plus 2x Beauty Pass points on every beauty buy this week.",
    link: { to: "/categories/$slug", params: { slug: "makeup" } },
    cta: "Shop Makeup",
  },
  {
    image: hero2,
    alt: "Smartphone with cosmetics, gift boxes and confetti on a pink background",
    kicker: "Beauty Pass",
    title: "White. Black. Gold.",
    body: "Join free and start earning points on every dollar spent in SGD.",
    link: { to: "/sign_in" },
    cta: "Join Beauty Pass",
  },
  {
    image: hero3,
    alt: "Two glass serum dropper bottles on a white podium",
    kicker: "Skincare Edit",
    title: "Barrier-first skincare",
    body: "Built for humidity and aircon. Free shipping above $35.",
    link: { to: "/categories/$slug", params: { slug: "skincare" } },
    cta: "Shop Skincare",
  },
];

export function HomePage() {
  const { tier, variant, openOffer } = useStore();
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    track("View Sephora SG Home");
  }, []);

  useEffect(() => {
    track("View Recommended For You", {
      "Beauty Pass Tier": tier,
      "Rec Channel": "In-App",
    });
  }, [tier]);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const current = slides[slide];
  const nudge =
    variant === "Treatment A"
      ? "Treatment A · Add 3 free samples to this order"
      : variant === "Treatment B"
        ? "Treatment B · Redeem 250 points on these picks"
        : "Picked for your skin type and shade range";

  return (
    <>
      <section className="relative">
        <img
          src={current.image}
          alt={current.alt}
          width={1600}
          height={800}
          className="h-[420px] w-full object-cover md:h-[520px]"
        />
        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-primary/70 to-transparent">
          <div className="container-x max-w-xl text-primary-foreground">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary-foreground">
              {current.kicker}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{current.title}</h1>
            <p className="mt-4 max-w-md text-sm md:text-base">{current.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                {...current.link}
                className="rounded-sm bg-sephora-red px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                {current.cta}
              </Link>
              <button
                onClick={() => openOffer("App Reward")}
                className="rounded-sm border border-primary-foreground px-6 py-3 text-xs font-semibold uppercase tracking-widest"
              >
                See app-exclusive offer
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          {slides.map((s, i) => (
            <button
              key={s.title}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setSlide(i)}
              className={`h-1.5 w-8 rounded-full ${i === slide ? "bg-sephora-red" : "bg-background/60"}`}
            />
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Shop by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="group block border border-border"
            >
              <img
                src={c.image}
                alt={c.alt}
                width={800}
                height={800}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <p className="p-3 text-center text-[11px] font-bold uppercase tracking-[0.16em]">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pb-16">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Recommended for you</h2>
            <p className="mt-2 text-sm text-muted-foreground">{nudge}</p>
          </div>
          <Link to="/categories/$slug" params={{ slug: "skincare" }} className="text-xs font-semibold uppercase tracking-widest text-sephora-red">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-secondary py-16">
        <div className="container-x">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Bestsellers in Singapore</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {products.slice(2, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Shop by brand</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {brands.map((b) => (
            <Link
              key={b}
              to="/categories/$slug"
              params={{ slug: "makeup" }}
              className="border border-border px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] hover:border-sephora-red hover:text-sephora-red"
            >
              {b}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x grid gap-6 pb-16 md:grid-cols-3">
        <div className="border border-border">
          <img src={beautyPass} alt="White, black and gold membership cards" width={1400} height={700} loading="lazy" className="h-48 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-lg font-bold">Beauty Pass</h3>
            <p className="mt-2 text-sm text-muted-foreground">White, Black and Gold tiers. Earn points, birthday gifts and free samples.</p>
            <Link to="/rewards-boutique" className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-sephora-red">
              Rewards Boutique
            </Link>
          </div>
        </div>
        <div className="border border-border">
          <img src={serviceMakeover} alt="Makeup artist applying makeup to a client in store" width={1000} height={700} loading="lazy" className="h-48 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-lg font-bold">Book Beauty Services</h3>
            <p className="mt-2 text-sm text-muted-foreground">Makeovers, skincare consults and fragrance matching at ION Orchard.</p>
            <Link to="/beauty-services" className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-sephora-red">
              Book now
            </Link>
          </div>
        </div>
        <div className="border border-border">
          <img src={beautyClass} alt="Group attending a beauty class in a store" width={1000} height={700} loading="lazy" className="h-48 w-full object-cover" />
          <div className="p-6">
            <h3 className="text-lg font-bold">Beauty Classes</h3>
            <p className="mt-2 text-sm text-muted-foreground">Free in-store and virtual classes with our Beauty Advisors.</p>
            <Link to="/beauty-classes" className="mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-sephora-red">
              Register
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container-x max-w-2xl text-center">
          <h2 className="text-2xl font-black uppercase tracking-[0.14em]">Get the app-exclusive drops</h2>
          <p className="mt-3 text-sm">Sign up for SG offers, App Fest alerts and new launches.</p>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) {
                toast.error("Enter a valid email address");
                return;
              }
              track("Lead Form Completed", { campaign_name: "SG - Beauty Pass - Q1 2026" });
              setSubscribed(true);
              toast.success("You're on the list. Check your inbox for App Fest offers.");
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.sg"
              aria-label="Email address"
              className="flex-1 rounded-sm bg-background px-4 py-3 text-sm text-foreground outline-none"
            />
            <button
              type="submit"
              className="rounded-sm bg-sephora-red px-6 py-3 text-xs font-semibold uppercase tracking-widest"
            >
              {subscribed ? "Subscribed" : "Sign me up"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}