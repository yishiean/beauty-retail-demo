import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { track } from "@/utils/amplitude";
import serviceMakeover from "@/assets/service-makeover.jpg";
import serviceSkincare from "@/assets/service-skincare.jpg";
import serviceFragrance from "@/assets/service-fragrance.jpg";

export const Route = createFileRoute("/beauty-services")({
  head: () => ({
    meta: [
      { title: "Book Beauty Services — Beauty Retail Demo" },
      { name: "description", content: "Book a makeover, skincare consult or fragrance matching session in Singapore stores." },
      { property: "og:title", content: "Book Beauty Services — Beauty Retail Demo" },
      { property: "og:description", content: "Complimentary in-store beauty services for Beauty Pass members." },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { type: "Makeover", title: "45-min Full Makeover", body: "Full-face application with a Beauty Advisor at ION Orchard.", image: serviceMakeover, alt: "Makeup artist applying makeup to a seated client" },
  { type: "Skincare Consult", title: "Skin Analysis & Routine Build", body: "Digital skin scan plus a routine built for humidity and aircon.", image: serviceSkincare, alt: "Consultant analysing a client's skin in store" },
  { type: "Fragrance Match", title: "Scent Profiling Session", body: "Find your signature scent across 200+ fragrances.", image: serviceFragrance, alt: "Woman smelling a perfume test strip at a fragrance counter" },
] as const;

function ServicesPage() {
  const [booked, setBooked] = useState<string | null>(null);

  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-black">Book Beauty Services</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        Complimentary for Beauty Pass members with any $60 purchase. ION Orchard · VivoCity · Jewel Changi.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {services.map((s) => (
          <div key={s.type} className="flex flex-col border border-border">
            <img src={s.image} alt={s.alt} width={1000} height={700} loading="lazy" className="h-48 w-full object-cover" />
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sephora-red">{s.type}</p>
              <h2 className="mt-2 text-lg font-bold">{s.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.body}</p>
              <button
                onClick={() => {
                  track("Book Beauty Service", { "Service Type": s.type });
                  setBooked(s.type);
                  toast.success(`${s.title} booked — we'll confirm by SMS`);
                }}
                className="mt-5 rounded-sm bg-primary px-4 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground"
              >
                {booked === s.type ? "Booked ✓" : "Book now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}