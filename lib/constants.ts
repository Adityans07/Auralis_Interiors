import type {
  DesignStyle,
  DesignType,
  Mood,
  SpaceType,
  Timeline,
} from "./types";

export const BRAND = {
  name: "Auralis Interiors",
  tagline:
    "AI-powered interiors designed around your space, budget, and lifestyle.",
  email: "hello@auralisinteriors.com",
  phone: "+1 (415) 555-0142",
  address: "24 Marlow Studios, San Francisco, CA 94108",
  hours: "Mon–Fri · 9:00 AM – 6:00 PM PT",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Try Us", href: "/try-us" },
  { label: "About Us", href: "/about" },
  { label: "Blogs", href: "/blogs" },
  { label: "Booking", href: "/booking" },
  { label: "Contact Us", href: "/contact" },
] as const;

/** localStorage key that tracks whether the free generation was used (demo UX only). */
export const FREE_GEN_STORAGE_KEY = "auralis_free_generation";

/** localStorage key for the MOCK authenticated customer session (demo only). */
export const AUTH_STORAGE_KEY = "auralis_customer_session";

/** localStorage key used to preserve an intended destination through login. */
export const REDIRECT_STORAGE_KEY = "auralis_redirect_after_auth";

/** Account area navigation (rendered in the sidebar + user dropdown). */
export const ACCOUNT_NAV_LINKS = [
  { label: "Dashboard", href: "/account", icon: "LayoutDashboard" },
  { label: "My Designs", href: "/account/designs", icon: "LayoutGrid" },
  { label: "Bookings", href: "/account/bookings", icon: "CalendarDays" },
  { label: "Billing", href: "/account/billing", icon: "CreditCard" },
  { label: "Profile", href: "/account/profile", icon: "User" },
  { label: "Settings", href: "/account/settings", icon: "Settings" },
] as const;

export const DESIGN_TYPES: { value: DesignType; label: string; description: string }[] = [
  {
    value: "interior",
    label: "Interior",
    description: "Rooms and indoor living spaces.",
  },
  {
    value: "exterior",
    label: "Exterior",
    description: "Facades, gardens, patios and outdoor areas.",
  },
];

export const SPACE_TYPES: { value: SpaceType; label: string }[] = [
  { value: "living-room", label: "Living Room" },
  { value: "bedroom", label: "Bedroom" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "office", label: "Office" },
  { value: "dining-room", label: "Dining Room" },
  { value: "balcony", label: "Balcony" },
  { value: "garden", label: "Garden" },
  { value: "house-exterior", label: "House Exterior" },
  { value: "commercial-space", label: "Commercial Space" },
  { value: "other", label: "Other" },
];

export const STYLE_OPTIONS: {
  value: DesignStyle;
  label: string;
  description: string;
}[] = [
  { value: "modern", label: "Modern", description: "Clean lines, bold statements." },
  { value: "minimal", label: "Minimal", description: "Calm, uncluttered, intentional." },
  { value: "luxury", label: "Luxury", description: "Rich materials, refined details." },
  { value: "scandinavian", label: "Scandinavian", description: "Light woods, cozy warmth." },
  { value: "bohemian", label: "Bohemian", description: "Layered textures, free spirit." },
  { value: "industrial", label: "Industrial", description: "Raw metals, exposed structure." },
  { value: "traditional", label: "Traditional", description: "Timeless, classic elegance." },
  { value: "contemporary", label: "Contemporary", description: "Current, evolving, sleek." },
  { value: "japandi", label: "Japandi", description: "Japanese calm meets Nordic craft." },
  { value: "custom", label: "Custom", description: "Tell us your own vision." },
];

export const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "cozy", label: "Cozy" },
  { value: "premium", label: "Premium" },
  { value: "bright", label: "Bright" },
  { value: "calm", label: "Calm" },
  { value: "bold", label: "Bold" },
  { value: "natural", label: "Natural" },
];

export const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "immediately", label: "Immediately" },
  { value: "within-1-month", label: "Within 1 month" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "just-exploring", label: "Just exploring" },
];

export const BUDGET_RANGES = [
  "Under $2,000",
  "$2,000 – $5,000",
  "$5,000 – $10,000",
  "$10,000 – $25,000",
  "$25,000+",
];

/** Accepted upload MIME types + max size for the image dropzone. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
export const MAX_IMAGE_SIZE_MB = 10;

/** Loading messages cycled through during mock design generation. */
export const GENERATION_STEPS = [
  "Analyzing your space…",
  "Matching products near your location…",
  "Creating design concepts…",
  "Finalizing your proposals…",
];
