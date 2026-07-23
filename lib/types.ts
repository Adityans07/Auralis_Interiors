/**
 * Auralis Interiors — Shared TypeScript domain types.
 *
 * These types describe the contract between the frontend and the future
 * backend/AI service. When the backend is implemented (see lib/services),
 * these shapes should map 1:1 to API request/response payloads.
 */

/* ----------------------------- Core enums ----------------------------- */

export type DesignType = "interior" | "exterior";

export type SpaceType =
  | "living-room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "office"
  | "dining-room"
  | "balcony"
  | "garden"
  | "house-exterior"
  | "commercial-space"
  | "other";

export type DesignStyle =
  | "modern"
  | "minimal"
  | "luxury"
  | "scandinavian"
  | "bohemian"
  | "industrial"
  | "traditional"
  | "contemporary"
  | "japandi"
  | "custom";

export type Mood = "cozy" | "premium" | "bright" | "calm" | "bold" | "natural";

export type Timeline =
  | "immediately"
  | "within-1-month"
  | "1-3-months"
  | "just-exploring";

export type BudgetStatus =
  | "within-budget"
  | "slightly-above"
  | "premium-option";

export type ItemCategory =
  | "furniture"
  | "decor"
  | "lighting"
  | "exterior";

/* ----------------------------- Products ------------------------------- */

export interface Product {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  currency: string;
  quantity: number;
  /** Whether the product is available near the user's provided location. */
  locationAvailability: boolean;
  image: string;
  description: string;
}

/** A product embedded in a design, with UI toggle state. */
export interface DesignProduct extends Product {
  /** Whether the user currently wants this product included in the design. */
  included: boolean;
}

/* -------------------------- Item selection ---------------------------- */

export interface SelectableItem {
  id: string;
  label: string;
  category: ItemCategory;
  designType: DesignType | "both";
}

/** A user-selected item during the Try Us flow. */
export interface SelectedItem {
  id: string;
  label: string;
  category: ItemCategory;
}

/* --------------------------- Location --------------------------------- */

export interface LocationInfo {
  city: string;
  state?: string;
  country: string;
  zip?: string;
}

/* --------------------------- Try Us form ------------------------------ */

export interface TryUsFormData {
  // Step 1 — Space details
  imageName?: string;
  imagePreviewUrl?: string;
  uploadedImageUrl?: string;
  uploadedImageKey?: string;
  description?: string;
  designType: DesignType;
  spaceType: SpaceType;
  approxSize?: string;
  conditionNotes?: string;

  // Step 2 — Preferences
  style: DesignStyle;
  colorPreferences?: string;
  mood?: Mood;
  budget: number;
  currency: string;
  location: LocationInfo;
  timeline?: Timeline;

  // Step 3 — Items
  selectedItems: SelectedItem[];

  // Step 4 — extras
  extraNotes?: string;
}

/* --------------------- Generation / results --------------------------- */

/** Payload sent to POST /api/designs/generate */
export interface DesignGenerationPayload {
  designType: DesignType;
  spaceType: SpaceType;
  description?: string;
  imageName?: string;
  uploadedImageUrl?: string;
  uploadedImageKey?: string;
  style: DesignStyle;
  mood?: Mood;
  colorPreferences?: string;
  budget: number;
  currency: string;
  location: LocationInfo;
  timeline?: Timeline;
  selectedItems: SelectedItem[];
  extraNotes?: string;
  paymentId?: string;
  stripeCheckoutSessionId?: string;
}

export interface GeneratedDesign {
  id: string;
  title: string;
  description: string;
  style: DesignStyle;
  previewImage: string;
  estimatedTotal: number;
  currency: string;
  budgetStatus: BudgetStatus;
  products: DesignProduct[];
  designNotes: string[];
}

/** Payload sent to POST /api/designs/select */
export interface SelectedDesignPayload {
  designId: string;
  includedProductIds: string[];
  adjustedTotal: number;
  currency: string;
  contact: ContactSummary;
}

export interface ContactSummary {
  name: string;
  email: string;
  phone: string;
  preferredContactTime?: string;
}

/* --------------------------- Booking ---------------------------------- */

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  projectType: DesignType | "consultation";
  preferredDate: string;
  preferredTime: string;
  location: string;
  budgetRange: string;
  message?: string;
  designReference?: string;
}

/* --------------------------- Contact ---------------------------------- */

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/* ----------------------------- Blogs ---------------------------------- */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string; // ISO date
  readTime: string;
  coverImage: string;
  featured?: boolean;
  content: string[]; // paragraphs / markdown-ish blocks
}

/* -------------------------- Testimonials ------------------------------ */

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number; // 1-5
  quote: string;
  avatar: string;
}

/* --------------------------- API envelope ----------------------------- */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FreeGenerationStatus {
  hasUsedFreeGeneration: boolean;
  generationsUsed: number;
  canUseFreeGeneration?: boolean;
  freeGenerationUsed?: boolean;
  requiresPayment?: boolean;
  bonusFreeGenerations?: number;
}

export interface UploadedImageRef {
  imageUrl: string;
  imageKey: string;
}

export interface CheckoutSessionPayload {
  amount?: number;
  currency?: string;
  designRequestDraft?: Record<string, unknown>;
  designGenerationPayload?: Partial<DesignGenerationPayload>;
}

export interface CheckoutSessionResponse {
  paymentId: string;
  checkoutSessionId: string;
  checkoutUrl: string;
  amount: number;
  currency: string;
}

/* ============================ ACCOUNTS / AUTH ========================== */
/* NOTE: All auth below is MOCK, frontend-only. See lib/services/auth.ts.   */

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  emailVerified: boolean;
  freeGenerationUsed: boolean;
  createdAt: string; // ISO
  role?: "CUSTOMER" | "ADMIN";
  status?: "ACTIVE" | "SUSPENDED" | "DELETED";
  // Optional profile fields
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  preferredStyle?: DesignStyle;
  preferredContactTime?: string;
  marketingOptIn?: boolean;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  customer: Customer | null;
  status: AuthStatus;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  marketingOptIn?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token?: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  preferredStyle?: DesignStyle;
  preferredContactTime?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/* ---------------------------- Account data ---------------------------- */

export type DesignRequestStatus =
  | "draft"
  | "generating"
  | "completed"
  | "payment-required"
  | "paid"
  | "selected"
  | "failed";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type PaymentStatus = "paid" | "pending" | "failed" | "free";

export interface RecentActivity {
  id: string;
  label: string;
  date: string; // ISO
  type: "design" | "booking" | "payment" | "account";
}

export interface AccountOverview {
  customerName: string;
  freeGenerationUsed: boolean;
  totalDesignRequests: number;
  savedDesigns: number;
  selectedDesignTitle?: string;
  upcomingBookings: number;
  recentActivity: RecentActivity[];
}

export interface CustomerDesignRequest {
  id: string;
  createdAt: string; // ISO
  status: DesignRequestStatus;
  designType: DesignType;
  spaceType: SpaceType;
  style: DesignStyle;
  budget: number;
  currency: string;
  location: LocationInfo;
  description?: string;
  imageName?: string;
  selectedItems: SelectedItem[];
  generatedDesigns: GeneratedDesign[];
  selectedDesignId?: string;
}

export interface CustomerBooking {
  id: string;
  createdAt: string; // ISO
  preferredDate: string;
  preferredTime: string;
  projectType: DesignType | "consultation";
  status: BookingStatus;
  designReference?: string;
  location: string;
  message?: string;
}

export interface CustomerPayment {
  id: string;
  date: string; // ISO
  description: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: "free-generation" | "paid-generation" | "consultation" | "other";
}
