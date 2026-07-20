import type { DesignProduct, GeneratedDesign } from "../types";
import { PRODUCTS } from "./products";

/** Helper: build a DesignProduct (product + included flag) from a product id. */
function dp(id: string, quantity?: number): DesignProduct {
  const base = PRODUCTS.find((p) => p.id === id)!;
  return { ...base, quantity: quantity ?? base.quantity, included: true };
}

/**
 * Base mock design concepts returned by POST /api/designs/generate.
 * The service layer clones these and lightly personalizes them with the
 * user's chosen style/budget so results feel tailored.
 */
export const BASE_DESIGNS: GeneratedDesign[] = [
  {
    id: "d-serene",
    title: "Serene Sanctuary",
    description:
      "A calm, light-filled scheme built around natural textures and soft tonal layering for everyday ease.",
    style: "minimal",
    previewImage: "https://picsum.photos/seed/design-serene/900/600",
    estimatedTotal: 0,
    currency: "USD",
    budgetStatus: "within-budget",
    products: [dp("p-sofa-01"), dp("p-coffee-01"), dp("p-rug-01"), dp("p-floor-01"), dp("p-plant-01", 1)],
    designNotes: [
      "Grounded by a warm sand palette with oak accents.",
      "Layered lighting keeps evenings soft and inviting.",
      "Every piece is available near your location.",
    ],
  },
  {
    id: "d-atelier",
    title: "Modern Atelier",
    description:
      "Confident, gallery-inspired styling with sculptural furniture and curated art for a refined statement.",
    style: "modern",
    previewImage: "https://picsum.photos/seed/design-atelier/900/600",
    estimatedTotal: 0,
    currency: "USD",
    budgetStatus: "slightly-above",
    products: [dp("p-sofa-01"), dp("p-chair-01", 2), dp("p-art-01", 3), dp("p-ceil-01"), dp("p-rug-01")],
    designNotes: [
      "Statement pendant anchors the seating arrangement.",
      "Art trio adds height and a personal focal point.",
      "One item may have a short lead time in your area.",
    ],
  },
  {
    id: "d-haven",
    title: "Warm Haven",
    description:
      "A cozy, tactile space with generous seating and ambient lighting designed for relaxed gatherings.",
    style: "scandinavian",
    previewImage: "https://picsum.photos/seed/design-haven/900/600",
    estimatedTotal: 0,
    currency: "USD",
    budgetStatus: "within-budget",
    products: [dp("p-sofa-01"), dp("p-coffee-01"), dp("p-curtain-01", 2), dp("p-table-lamp-01", 2), dp("p-plant-01", 2)],
    designNotes: [
      "Sheer drapery softens daylight beautifully.",
      "Paired table lamps create a warm, even glow.",
      "Fully in stock near your location.",
    ],
  },
  {
    id: "d-signature",
    title: "Signature Luxe",
    description:
      "An elevated, richly layered proposal with premium finishes for those who want a true showpiece.",
    style: "luxury",
    previewImage: "https://picsum.photos/seed/design-signature/900/600",
    estimatedTotal: 0,
    currency: "USD",
    budgetStatus: "premium-option",
    products: [dp("p-sofa-01"), dp("p-chair-01", 2), dp("p-coffee-01"), dp("p-ceil-01"), dp("p-rug-01"), dp("p-art-01", 3)],
    designNotes: [
      "A curated, high-impact material story.",
      "Best-in-class comfort and longevity.",
      "A premium investment above your stated budget.",
    ],
  },
];
