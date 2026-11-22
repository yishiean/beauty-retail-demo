import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { track } from "@/utils/amplitude";
import { useStore } from "@/lib/store";
import catSkincare from "@/assets/cat-skincare.jpg";
import catHair from "@/assets/cat-hair.jpg";
import catFragrance from "@/assets/cat-fragrance.jpg";

export const Route = createFileRoute("/preferences")({
  head: () => ({
    meta: [
      { title: "Set Your Beauty Preferences — Beauty Retail Demo" },
      {
        name: "description",
        content: "Tell us your skin concerns, hair type and fragrance family for personalised beauty picks.",
      },
      { property: "og:title", content: "Set Your Beauty Preferences" },
      { property: "og:description", content: "Personalise your Beauty Retail Demo recommendations in 3 steps." },
    ],
  }),
  component: PreferencesPage,
});

const steps = [
  {
    key: "Skin Concerns" as const,
    title: "What are your skin concerns?",
    image: catSkincare,
    alt: "Skincare cream jar and serum bottle",
    options: ["Dullness", "Acne", "Dryness", "Pigmentation", "Fine lines", "Oil control"],
  },
  {
    key: "Hair Type" as const,
    title: "What's your hair type?",
    image: catHair,
    alt: "Shampoo, hair oil and wooden comb",
    options: ["Straight", "Wavy", "Curly", "Coily", "Colour-treated", "Fine"],
  },
  {
    key: "Fragrance Family" as const,
    title: "Which fragrance family do you love?",
    image: catFragrance,
    alt: "Luxury perfume bottle on black surface",
    options: ["Floral", "Fresh", "Woody", "Oriental", "Citrus", "Gourmand"],
  },
];

function PreferencesPage() {
  const navigate = useNavigate();
  const { tier } = useStore();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<Record<string, string[]>>({});

  const current = steps[step];
  const selected = picked[current.key] ?? [];

  const toggle = (o: string) =>
    setPicked((p) => {
      const cur = p[current.key] ?? [];
      return {
        ...p,
        [current.key]: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o],
      };
    });

  const save = () => {
    track("Set Beauty Preferences", {
      "Preference Type": current.key,
      "Beauty Pass Tier": tier,
    });
    toast.success("Beauty preferences saved");
    navigate({ to: "/categories/$slug", params: { slug: "makeup" } });
  };

  return (
    <div className="container-x max-w-3xl py-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sephora-red">
        Step {step + 1} of {steps.length}
      </p>
      <h1 className="mt-3 text-3xl font-black">{current.title}</h1>
      <img
        src={current.image}
        alt={current.alt}
        width={800}
        height={800}
        loading="lazy"
        className="mt-6 h-56 w-full object-cover"
      />
      <div className="mt-6 flex flex-wrap gap-3">
        {current.options.map((o) => (
          <button
            key={o}
            onClick={() => toggle(o)}
            className={`rounded-full border px-5 py-2.5 text-sm ${
              selected.includes(o)
                ? "border-sephora-red bg-sephora-red text-primary-foreground"
                : "border-border hover:border-primary"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="rounded-sm border border-border px-6 py-3 text-xs font-semibold uppercase tracking-widest"
          >
            Back
          </button>
        )}
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="rounded-sm bg-primary px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={save}
            className="rounded-sm bg-sephora-red px-6 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
          >
            Save preferences
          </button>
        )}
      </div>
    </div>
  );
}