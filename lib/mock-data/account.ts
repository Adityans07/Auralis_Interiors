import type {
  CustomerBooking,
  CustomerDesignRequest,
  CustomerPayment,
  GeneratedDesign,
} from "../types";
import { BASE_DESIGNS } from "./designResults";

/**
 * Mock account data for the customer dashboard. In production this comes from
 * the /api/account/* endpoints scoped to the authenticated user.
 * Dates are fixed ISO strings so the demo is deterministic.
 */

/** Give base designs concrete totals for account history. */
function withTotals(designs: GeneratedDesign[]): GeneratedDesign[] {
  return designs.map((d) => ({
    ...d,
    products: d.products.map((p) => ({ ...p })),
    estimatedTotal: d.products.reduce((s, p) => s + p.price * p.quantity, 0),
  }));
}

export const MOCK_DESIGN_REQUESTS: CustomerDesignRequest[] = [
  {
    id: "REQ-2041",
    createdAt: "2026-06-30T14:22:00.000Z",
    status: "selected",
    designType: "interior",
    spaceType: "living-room",
    style: "minimal",
    budget: 6000,
    currency: "USD",
    location: { city: "Austin", state: "TX", country: "USA", zip: "73301" },
    description:
      "North-facing living room, ~20m², white walls, lots of daylight. Keeping the wood floors.",
    selectedItems: [
      { id: "sofa", label: "Sofa", category: "furniture" },
      { id: "coffee-table", label: "Coffee Table", category: "furniture" },
      { id: "rugs", label: "Rugs / Carpets", category: "decor" },
      { id: "floor-lamps", label: "Floor Lamps", category: "lighting" },
    ],
    generatedDesigns: withTotals(BASE_DESIGNS.slice(0, 3)),
    selectedDesignId: "d-serene",
  },
  {
    id: "REQ-2038",
    createdAt: "2026-06-18T10:05:00.000Z",
    status: "completed",
    designType: "interior",
    spaceType: "bedroom",
    style: "japandi",
    budget: 4500,
    currency: "USD",
    location: { city: "Austin", state: "TX", country: "USA", zip: "73301" },
    description: "Primary bedroom refresh with calm, natural textures.",
    selectedItems: [
      { id: "bed", label: "Bed", category: "furniture" },
      { id: "table-lamps", label: "Table Lamps", category: "lighting" },
      { id: "curtains", label: "Curtains", category: "decor" },
    ],
    generatedDesigns: withTotals(BASE_DESIGNS.slice(1, 4)),
  },
  {
    id: "REQ-2033",
    createdAt: "2026-05-27T16:40:00.000Z",
    status: "payment-required",
    designType: "exterior",
    spaceType: "garden",
    style: "modern",
    budget: 8000,
    currency: "USD",
    location: { city: "Austin", state: "TX", country: "USA", zip: "73301" },
    description: "Backyard patio and garden concept for entertaining.",
    selectedItems: [
      { id: "outdoor-seating", label: "Outdoor Seating", category: "exterior" },
      { id: "garden-plants", label: "Garden Plants", category: "exterior" },
      { id: "pathway-lights", label: "Pathway Lights", category: "exterior" },
    ],
    generatedDesigns: [],
  },
  {
    id: "REQ-2029",
    createdAt: "2026-05-11T09:15:00.000Z",
    status: "draft",
    designType: "interior",
    spaceType: "office",
    style: "industrial",
    budget: 3000,
    currency: "USD",
    location: { city: "Austin", state: "TX", country: "USA", zip: "73301" },
    description: "Home office nook — still gathering ideas.",
    selectedItems: [
      { id: "study-table", label: "Study Table", category: "furniture" },
      { id: "bookshelf", label: "Bookshelf", category: "furniture" },
    ],
    generatedDesigns: [],
  },
];

export const MOCK_BOOKINGS: CustomerBooking[] = [
  {
    id: "BK-2026-0147",
    createdAt: "2026-07-01T11:00:00.000Z",
    preferredDate: "2026-07-20",
    preferredTime: "10:30",
    projectType: "interior",
    status: "confirmed",
    designReference: "Serene Sanctuary",
    location: "Austin, TX",
    message: "Would love to finalize the living room selections.",
  },
  {
    id: "BK-2026-0121",
    createdAt: "2026-06-19T13:30:00.000Z",
    preferredDate: "2026-06-28",
    preferredTime: "15:00",
    projectType: "consultation",
    status: "completed",
    location: "Austin, TX",
  },
  {
    id: "BK-2026-0163",
    createdAt: "2026-07-08T08:45:00.000Z",
    preferredDate: "2026-07-30",
    preferredTime: "09:00",
    projectType: "exterior",
    status: "pending",
    designReference: "Garden concept (REQ-2033)",
    location: "Austin, TX",
  },
];

export const MOCK_PAYMENTS: CustomerPayment[] = [
  {
    id: "PAY-9001",
    date: "2026-06-30T14:25:00.000Z",
    description: "First AI design generation",
    amount: 0,
    currency: "USD",
    status: "free",
    type: "free-generation",
  },
  {
    id: "PAY-9014",
    date: "2026-06-18T10:07:00.000Z",
    description: "Additional AI design generation",
    amount: 19,
    currency: "USD",
    status: "paid",
    type: "paid-generation",
  },
  {
    id: "PAY-9022",
    date: "2026-05-27T16:42:00.000Z",
    description: "Exterior design generation",
    amount: 19,
    currency: "USD",
    status: "pending",
    type: "paid-generation",
  },
];

export function getMockDesignRequestById(id: string) {
  return MOCK_DESIGN_REQUESTS.find((r) => r.id === id);
}
