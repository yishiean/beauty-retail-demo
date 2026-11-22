import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { track } from "@/utils/amplitude";
import { useStore } from "@/lib/store";
import serviceSkincare from "@/assets/service-skincare.jpg";

export const Route = createFileRoute("/stores")({
  head: () => ({
    meta: [
      { title: "Find a Store — Beauty Retail Demo" },
      { name: "description", content: "Flagship stores at ION Orchard, VivoCity, Jewel Changi and Raffles City." },
      { property: "og:title", content: "Find a Store — Beauty Retail Demo" },
      { property: "og:description", content: "Store hours, Click & Collect and in-store services in Singapore." },
    ],
  }),
  component: StoresPage,
});

const stores = [
  { name: "ION Orchard", address: "2 Orchard Turn #B2-01", hours: "10am – 10pm" },
  { name: "VivoCity", address: "1 HarbourFront Walk #01-58", hours: "10am – 10pm" },
  { name: "Jewel Changi", address: "78 Airport Blvd #02-232", hours: "10am – 11pm" },
  { name: "Raffles City", address: "252 North Bridge Rd #01-19", hours: "10am – 9.30pm" },
];

function StoresPage() {
  const { tier } = useStore();

  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-black">Find a Store</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <ul className="divide-y divide-border border-y border-border">
          {stores.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-4 py-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest">{s.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.address}</p>
                <p className="text-xs text-muted-foreground">Open daily {s.hours}</p>
              </div>
              <button
                onClick={() => {
                  track("Contact Beauty Advisor", { "Contact Channel": "In-Store", "Beauty Pass Tier": tier });
                  toast.success(`A Beauty Advisor at ${s.name} will assist you`);
                }}
                className="shrink-0 rounded-sm border border-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-widest"
              >
                Contact advisor
              </button>
            </li>
          ))}
        </ul>
        <img src={serviceSkincare} alt="Beauty advisor consulting a customer in a beauty store" width={1000} height={700} loading="lazy" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}