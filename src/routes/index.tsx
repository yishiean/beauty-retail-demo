import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beauty Retail Demo — Makeup, Skincare & Beauty Pass" },
      {
        name: "description",
        content:
          "Shop makeup, skincare, hair and fragrance in SGD. Join Beauty Pass, claim free samples and book beauty services.",
      },
      { property: "og:title", content: "Beauty Retail Demo — Makeup, Skincare & Beauty Pass" },
      {
        property: "og:description",
        content: "Shop makeup, skincare, hair and fragrance in SGD. Join Beauty Pass, claim free samples and book beauty services.",
      },
    ],
  }),
  component: HomePage,
});
