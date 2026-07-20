import type { DesignStyle } from "../types";

export interface StyleShowcase {
  value: DesignStyle;
  name: string;
  blurb: string;
  image: string;
}

/**
 * Design styles showcased on the home page.
 * Images are placeholder photos (picsum) — swap for real assets later.
 */
export const DESIGN_STYLES: StyleShowcase[] = [
  {
    value: "modern",
    name: "Modern",
    blurb: "Clean geometry and confident silhouettes.",
    image: "https://picsum.photos/seed/auralis-modern/800/1000",
  },
  {
    value: "minimal",
    name: "Minimal",
    blurb: "Space to breathe, nothing wasted.",
    image: "https://picsum.photos/seed/auralis-minimal/800/1000",
  },
  {
    value: "luxury",
    name: "Luxury",
    blurb: "Layered richness and tactile finishes.",
    image: "https://picsum.photos/seed/auralis-luxury/800/1000",
  },
  {
    value: "scandinavian",
    name: "Scandinavian",
    blurb: "Warm woods and gentle light.",
    image: "https://picsum.photos/seed/auralis-scandi/800/1000",
  },
  {
    value: "bohemian",
    name: "Bohemian",
    blurb: "Free-spirited texture and color.",
    image: "https://picsum.photos/seed/auralis-boho/800/1000",
  },
  {
    value: "industrial",
    name: "Industrial",
    blurb: "Raw materials with an urban edge.",
    image: "https://picsum.photos/seed/auralis-industrial/800/1000",
  },
  {
    value: "traditional",
    name: "Classic",
    blurb: "Timeless proportions and detail.",
    image: "https://picsum.photos/seed/auralis-classic/800/1000",
  },
];
