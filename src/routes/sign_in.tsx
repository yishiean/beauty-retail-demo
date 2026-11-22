import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { identifyUser, setGroup, track } from "@/utils/amplitude";
import { useStore } from "@/lib/store";
import beautyPass from "@/assets/beauty-pass.jpg";

export const Route = createFileRoute("/sign_in")({
  head: () => ({
    meta: [
      { title: "Join Beauty Pass — Beauty Retail Demo" },
      {
        name: "description",
        content: "Join Beauty Pass free: earn points on every SGD spent, birthday gifts and free samples.",
      },
      { property: "og:title", content: "Join Beauty Pass — Beauty Retail Demo" },
      { property: "og:description", content: "White, Black and Gold tiers. Free to join." },
    ],
  }),
  component: SignUpPage,
});

const variants = ["Control", "Treatment A", "Treatment B"] as const;

function SignUpPage() {
  const navigate = useNavigate();
  const { setUser } = useStore();
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "25-34",
    gender: "Female",
    skinType: "Combination",
    skinTone: "Medium",
    prefCat: "Makeup",
    channel: "Web",
    spend: "$720",
    storeId: "SG-ION-Orchard",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email.includes("@")) {
      toast.error("Please enter your name and a valid email");
      return;
    }
    setLoading(true);
    const variant = variants[Math.floor(Math.random() * variants.length)];

    identifyUser({
      Age: form.age,
      Gender: form.gender,
      utm_campaign: "sg-beauty-pass-q1-2026",
      utm_source: "web",
      utm_medium: "organic",
      utm_term: "beauty pass singapore",
      utm_content: "signup-hero",
      "A/B Testing": variant,
      "Beauty Pass Tier": "White",
      "Shopper Type": "New",
      "First Purchase Date": new Date().toISOString().slice(0, 10),
      "Annual Beauty Spend (SGD)": form.spend,
      "Sampled Users": "Not Sampled",
      "Skin Type": form.skinType,
      "Skin Tone Range": form.skinTone,
      "Preferred Category": form.prefCat,
    });
    setGroup("Org Id", form.storeId);
    track("Join Beauty Pass", { "Signup Channel": form.channel, "Beauty Pass Tier": "White" });

    setUser({
      name: form.name,
      email: form.email,
      tier: "White",
      variant,
      preferredCategory: form.prefCat,
    });

    setTimeout(() => {
      setLoading(false);
      toast.success(`Welcome to Beauty Pass, ${form.name}! You're a White member.`);
      navigate({ to: "/preferences" });
    }, 600);
  };

  const field = "mt-1 w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-sephora-red";
  const label = "text-[11px] font-bold uppercase tracking-[0.18em]";

  return (
    <div className="container-x grid gap-12 py-14 lg:grid-cols-2">
      <div>
        <img
          src={beautyPass}
          alt="White, black and gold Beauty Pass membership cards"
          width={1400}
          height={700}
          className="w-full object-cover"
        />
        <h1 className="mt-8 text-4xl font-black leading-tight">Join Beauty Pass</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Free to join. Earn 1 point per $1 spent, unlock Black at $350 and Gold at $1,500 annual
          spend. Members get free samples with every order and a birthday gift.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          <li>· White — free samples & birthday gift</li>
          <li>· Black — 2x points events & free express shipping</li>
          <li>· Gold — priority beauty services & exclusive launches</li>
        </ul>
      </div>

      <form onSubmit={submit} className="border border-border p-8">
        <h2 className="text-xs font-bold uppercase tracking-[0.3em]">Create your account</h2>
        <div className="mt-6 grid gap-4">
          <div>
            <label className={label} htmlFor="name">Name</label>
            <input id="name" className={field} value={form.name} onChange={set("name")} placeholder="Wei Ling Tan" />
          </div>
          <div>
            <label className={label} htmlFor="email">Email</label>
            <input id="email" type="email" className={field} value={form.email} onChange={set("email")} placeholder="you@email.sg" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label} htmlFor="age">Age range</label>
              <select id="age" className={field} value={form.age} onChange={set("age")}>
                {["18-24", "25-34", "35-44", "45+"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="gender">Gender</label>
              <select id="gender" className={field} value={form.gender} onChange={set("gender")}>
                {["Female", "Male", "Non-binary", "Prefer not to say"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="skin">Skin type</label>
              <select id="skin" className={field} value={form.skinType} onChange={set("skinType")}>
                {["Dry", "Oily", "Combination"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="tone">Skin tone range</label>
              <select id="tone" className={field} value={form.skinTone} onChange={set("skinTone")}>
                {["Fair", "Medium", "Deep"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="cat">Preferred category</label>
              <select id="cat" className={field} value={form.prefCat} onChange={set("prefCat")}>
                {["Makeup", "Skincare", "Fragrance"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="channel">Signup channel</label>
              <select id="channel" className={field} value={form.channel} onChange={set("channel")}>
                {["App", "Web", "In-Store"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="spend">Annual beauty spend (SGD)</label>
              <select id="spend" className={field} value={form.spend} onChange={set("spend")}>
                {["$120", "$360", "$720", "$1500", "$3000"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label} htmlFor="store">Home store</label>
              <select id="store" className={field} value={form.storeId} onChange={set("storeId")}>
                {["SG-ION-Orchard", "SG-VivoCity", "SG-Jewel-Changi", "SG-Online"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <p className="rounded-sm bg-secondary p-3 text-xs text-muted-foreground">
            Your tier is auto-assigned: <strong>White</strong>
          </p>
          <button
            type="submit"
            disabled={loading}
            className="rounded-sm bg-sephora-red px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Creating your pass…" : "Join Beauty Pass"}
          </button>
        </div>
      </form>
    </div>
  );
}