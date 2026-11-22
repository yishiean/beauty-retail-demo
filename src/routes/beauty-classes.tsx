import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { track } from "@/utils/amplitude";
import beautyClass from "@/assets/beauty-class.jpg";
import catMakeup from "@/assets/cat-makeup.jpg";
import catFragrance from "@/assets/cat-fragrance.jpg";

export const Route = createFileRoute("/beauty-classes")({
  head: () => ({
    meta: [
      { title: "Beauty Classes — Beauty Retail Demo" },
      { name: "description", content: "Register for free in-store, virtual and one-on-one beauty classes in Singapore." },
      { property: "og:title", content: "Beauty Classes — Beauty Retail Demo" },
      { property: "og:description", content: "Makeup, skincare and fragrance classes with Beauty Advisors." },
    ],
  }),
  component: ClassesPage,
});

const classes = [
  { topic: "Makeup", title: "Everyday Humidity-Proof Base", format: "In-Store", slot: "Weekend", image: beautyClass, alt: "Group at a makeup workshop table in store" },
  { topic: "Skincare", title: "Barrier Repair 101", format: "Virtual", slot: "Evening", image: catMakeup, alt: "Eyeshadow palette and lipsticks flatlay" },
  { topic: "Fragrance", title: "Build Your Scent Wardrobe", format: "One-on-One", slot: "Weekday", image: catFragrance, alt: "Luxury perfume bottle on a black surface" },
] as const;

function ClassesPage() {
  const [registered, setRegistered] = useState<string[]>([]);
  const [attended, setAttended] = useState<string[]>([]);
  const [outcome, setOutcome] = useState("Purchased");

  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-black">Beauty Classes</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Free for Beauty Pass members. In-store, virtual or one-on-one with a Beauty Advisor.
      </p>

      <label className="mt-6 inline-block text-[11px] font-bold uppercase tracking-widest">
        Class outcome (demo)
        <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="ml-3 rounded-sm border border-border px-3 py-2 text-sm font-normal normal-case tracking-normal">
          {["Purchased", "Booked Service", "No Action"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </label>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {classes.map((c) => {
          const isReg = registered.includes(c.title);
          const isAtt = attended.includes(c.title);
          return (
            <div key={c.title} className="flex flex-col border border-border">
              <img src={c.image} alt={c.alt} width={1000} height={700} loading="lazy" className="h-48 w-full object-cover" />
              <div className="flex flex-1 flex-col p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sephora-red">
                  {c.topic} · {c.format} · {c.slot}
                </p>
                <h2 className="mt-2 flex-1 text-lg font-bold">{c.title}</h2>
                <button
                  onClick={() => {
                    if (isReg) return;
                    track("Register for Beauty Class", {
                      "Class Topic": c.topic,
                      "Class Format": c.format,
                      "Class Slot": c.slot,
                    });
                    setRegistered((r) => [...r, c.title]);
                    toast.success(`Registered for ${c.title}`);
                  }}
                  className="mt-5 rounded-sm bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
                >
                  {isReg ? "Registered ✓" : "Register"}
                </button>
                <button
                  disabled={!isReg || isAtt}
                  onClick={() => {
                    track("Attend Beauty Class", {
                      "Class Format": c.format,
                      "Class Topic": c.topic,
                      "Class Outcome": outcome,
                    });
                    setAttended((a) => [...a, c.title]);
                    toast.success("Attendance recorded. Enjoy your class!");
                  }}
                  className="mt-3 rounded-sm border border-border px-4 py-3 text-xs font-semibold uppercase tracking-widest disabled:opacity-40"
                >
                  {isAtt ? "Attended ✓" : "Mark as attended"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}