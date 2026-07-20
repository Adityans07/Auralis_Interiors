import type { ItemCategory, SelectableItem } from "../types";

/**
 * Item catalogue used by the Try Us "Select Items" step.
 * Grouped by category; each item is tagged with which design type it belongs to.
 */

export const ITEM_CATEGORY_LABELS: Record<ItemCategory, string> = {
  furniture: "Furniture",
  decor: "Decor",
  lighting: "Lighting",
  exterior: "Exterior",
};

export const SELECTABLE_ITEMS: SelectableItem[] = [
  // Furniture
  { id: "sofa", label: "Sofa", category: "furniture", designType: "interior" },
  { id: "bed", label: "Bed", category: "furniture", designType: "interior" },
  { id: "dining-table", label: "Dining Table", category: "furniture", designType: "interior" },
  { id: "coffee-table", label: "Coffee Table", category: "furniture", designType: "interior" },
  { id: "study-table", label: "Study Table", category: "furniture", designType: "interior" },
  { id: "wardrobe", label: "Wardrobe", category: "furniture", designType: "interior" },
  { id: "tv-unit", label: "TV Unit", category: "furniture", designType: "interior" },
  { id: "bookshelf", label: "Bookshelf", category: "furniture", designType: "interior" },
  { id: "accent-chair", label: "Accent Chair", category: "furniture", designType: "both" },

  // Decor
  { id: "decor-flowers", label: "Decor Flowers", category: "decor", designType: "both" },
  { id: "indoor-plants", label: "Indoor Plants", category: "decor", designType: "interior" },
  { id: "wall-art", label: "Wall Art", category: "decor", designType: "interior" },
  { id: "mirrors", label: "Mirrors", category: "decor", designType: "interior" },
  { id: "vases", label: "Vases", category: "decor", designType: "both" },
  { id: "sculptures", label: "Sculptures", category: "decor", designType: "both" },
  { id: "curtains", label: "Curtains", category: "decor", designType: "interior" },
  { id: "rugs", label: "Rugs / Carpets", category: "decor", designType: "interior" },

  // Lighting
  { id: "ceiling-lights", label: "Ceiling Lights", category: "lighting", designType: "interior" },
  { id: "floor-lamps", label: "Floor Lamps", category: "lighting", designType: "interior" },
  { id: "wall-lamps", label: "Wall Lamps", category: "lighting", designType: "both" },
  { id: "table-lamps", label: "Table Lamps", category: "lighting", designType: "interior" },
  { id: "outdoor-lights", label: "Outdoor Lights", category: "lighting", designType: "exterior" },

  // Exterior
  { id: "outdoor-seating", label: "Outdoor Seating", category: "exterior", designType: "exterior" },
  { id: "garden-plants", label: "Garden Plants", category: "exterior", designType: "exterior" },
  { id: "patio-table", label: "Patio Table", category: "exterior", designType: "exterior" },
  { id: "wall-cladding", label: "Wall Cladding", category: "exterior", designType: "exterior" },
  { id: "exterior-paint", label: "Exterior Paint", category: "exterior", designType: "exterior" },
  { id: "pathway-lights", label: "Pathway Lights", category: "exterior", designType: "exterior" },
];

/** Group items by category for grid rendering. */
export function groupItemsByCategory(items: SelectableItem[]) {
  const groups: Record<ItemCategory, SelectableItem[]> = {
    furniture: [],
    decor: [],
    lighting: [],
    exterior: [],
  };
  for (const item of items) groups[item.category].push(item);
  return groups;
}
