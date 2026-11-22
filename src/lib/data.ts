import catMakeup from "@/assets/cat-makeup.jpg";
import catSkincare from "@/assets/cat-skincare.jpg";
import catHair from "@/assets/cat-hair.jpg";
import catFragrance from "@/assets/cat-fragrance.jpg";
import catBath from "@/assets/cat-bath.jpg";
import catTools from "@/assets/cat-tools.jpg";
import pLipstick from "@/assets/p-lipstick.jpg";
import pSerum from "@/assets/p-serum.jpg";
import pFoundation from "@/assets/p-foundation.jpg";
import pPerfume from "@/assets/p-perfume.jpg";
import pMascara from "@/assets/p-mascara.jpg";
import pCream from "@/assets/p-cream.jpg";

export type Category = {
  slug: string;
  name: string;
  image: string;
  alt: string;
  eventCategory: "Makeup" | "Skincare" | "Fragrance";
};

export const categories: Category[] = [
  { slug: "makeup", name: "Makeup", image: catMakeup, alt: "Eyeshadow palette and lipsticks on a light background", eventCategory: "Makeup" },
  { slug: "skincare", name: "Skincare", image: catSkincare, alt: "Skincare cream jar and serum bottle", eventCategory: "Skincare" },
  { slug: "hair", name: "Hair", image: catHair, alt: "Shampoo and hair oil bottles with a wooden comb", eventCategory: "Skincare" },
  { slug: "fragrance", name: "Fragrance", image: catFragrance, alt: "Luxury perfume bottle on a black reflective surface", eventCategory: "Fragrance" },
  { slug: "bath-body", name: "Bath & Body", image: catBath, alt: "Body lotion, soap bars and loofah on marble", eventCategory: "Skincare" },
  { slug: "tools-brushes", name: "Tools & Brushes", image: catTools, alt: "Set of black professional makeup brushes", eventCategory: "Makeup" },
];

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  reviews: number;
  category: string;
  eventCategory: "Makeup" | "Skincare" | "Fragrance";
  image: string;
  alt: string;
  shades?: string[];
  inStock: boolean;
  blurb: string;
};

export const products: Product[] = [
  {
    id: "rouge-velvet-matte",
    name: "Rouge Velvet Matte Lipstick",
    brand: "SEPHORA COLLECTION",
    price: 29,
    rating: 4.6,
    reviews: 1284,
    category: "makeup",
    eventCategory: "Makeup",
    image: pLipstick,
    alt: "Red matte lipstick bullet on a white background",
    shades: ["01 Bare", "04 Rosewood", "07 Signature Red", "12 Plum Noir"],
    inStock: true,
    blurb: "A weightless matte bullet with 12-hour wear and a cushiony finish.",
  },
  {
    id: "glow-vitamin-c-serum",
    name: "Glow Vitamin C 15% Serum",
    brand: "LUMIÈRE LAB",
    price: 78,
    rating: 4.8,
    reviews: 942,
    category: "skincare",
    eventCategory: "Skincare",
    image: pSerum,
    alt: "Amber glass vitamin C serum bottle with dropper",
    inStock: true,
    blurb: "Brightening daily serum with stabilised vitamin C and ferulic acid.",
  },
  {
    id: "second-skin-foundation",
    name: "Second Skin Fluid Foundation",
    brand: "ATELIER SG",
    price: 62,
    rating: 4.4,
    reviews: 615,
    category: "makeup",
    eventCategory: "Makeup",
    image: pFoundation,
    alt: "Glass foundation bottle with black pump",
    shades: ["1N Porcelain", "3W Sand", "5N Almond", "7W Espresso"],
    inStock: true,
    blurb: "Buildable medium coverage that melts into skin. 40 shades in-store.",
  },
  {
    id: "rose-atlas-edp",
    name: "Rose Atlas Eau de Parfum 50ml",
    brand: "MAISON ORCHID",
    price: 156,
    rating: 4.7,
    reviews: 388,
    category: "fragrance",
    eventCategory: "Fragrance",
    image: pPerfume,
    alt: "Pink rectangular eau de parfum bottle",
    inStock: false,
    blurb: "Damask rose, lychee and cedar. A modern Singapore-friendly floral.",
  },
  {
    id: "lash-architect-mascara",
    name: "Lash Architect Volume Mascara",
    brand: "SEPHORA COLLECTION",
    price: 34,
    rating: 4.3,
    reviews: 2210,
    category: "makeup",
    eventCategory: "Makeup",
    image: pMascara,
    alt: "Black mascara tube and wand on white",
    inStock: true,
    blurb: "Humidity-proof volume built for the tropics.",
  },
  {
    id: "ceramide-barrier-cream",
    name: "Ceramide Barrier Repair Cream",
    brand: "LUMIÈRE LAB",
    price: 68,
    rating: 4.9,
    reviews: 1567,
    category: "skincare",
    eventCategory: "Skincare",
    image: pCream,
    alt: "White ceramic moisturiser jar with lid removed",
    inStock: true,
    blurb: "Rich-but-breathable ceramide cream for aircon-dry skin.",
  },
];

export const brands = [
  "SEPHORA COLLECTION",
  "LUMIÈRE LAB",
  "ATELIER SG",
  "MAISON ORCHID",
  "KAYA BOTANICA",
  "NOIR & CO.",
];

export const freeSamples = [
  { id: "s1", name: "Hydra Boost Mini Serum", category: "Skincare" as const },
  { id: "s2", name: "Velvet Blush Sachet", category: "Makeup" as const },
  { id: "s3", name: "Rose Atlas Vial 1.5ml", category: "Fragrance" as const },
];

export function productById(id: string) {
  return products.find((p) => p.id === id);
}

export function productsByCategory(slug: string) {
  const inCat = products.filter((p) => p.category === slug);
  return inCat.length ? inCat : products;
}