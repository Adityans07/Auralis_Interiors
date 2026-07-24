import { backendRequest } from "./http";
import type {
  ApiResponse,
  BlogPost,
  BookingFormData,
  CheckoutSessionPayload,
  CheckoutSessionResponse,
  ContactFormData,
  DesignGenerationPayload,
  FreeGenerationStatus,
  GeneratedDesign,
  LocationInfo,
  Product,
  SelectedDesignPayload,
  SelectedItem,
  UploadedImageRef,
} from "../types";

type BackendGeneratedDesign = {
  id: string;
  title: string;
  description: string;
  style: string;
  previewImage?: string;
  previewImageUrl?: string;
  estimatedTotal: number;
  currency: string;
  budgetStatus: "within-budget" | "slightly-above" | "premium-option";
  designNotes: string[];
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    currency: string;
    quantity: number;
    locationAvailability?: boolean;
    image?: string;
    imageUrl?: string;
    description: string;
    included?: boolean;
  }>;
};

type BackendGenerateResponse = {
  designRequestId: string;
  freeGenerationApplied?: boolean;
  remainingFreeGenerations?: number;
  paymentRequired?: boolean;
  designs: BackendGeneratedDesign[];
};

const designRequestIdByDesignId = new Map<string, string>();

function toDesignType(value: string): "INTERIOR" | "EXTERIOR" {
  return value.toLowerCase() === "exterior" ? "EXTERIOR" : "INTERIOR";
}

function asItemCategory(value: string): Product["category"] {
  if (value === "furniture" || value === "decor" || value === "lighting" || value === "exterior") {
    return value;
  }
  return "decor";
}

function normalizeBlogContent(content: unknown): string[] {
  if (Array.isArray(content)) {
    return content.map((item) => String(item)).filter(Boolean);
  }
  if (typeof content === "string") {
    return content
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

function mapBlogPost(post: any): BlogPost {
  return {
    id: String(post.id),
    slug: String(post.slug),
    title: String(post.title ?? "Untitled"),
    excerpt: String(post.excerpt ?? ""),
    category: String(post.category ?? "General"),
    author: String(post.author ?? post.authorName ?? "Auralis Team"),
    authorRole: String(post.authorRole ?? "Auralis Design Team"),
    date: String(post.date ?? new Date().toISOString()),
    readTime: String(post.readTime ?? "5 min read"),
    coverImage: String(post.coverImage ?? post.coverImageUrl ?? ""),
    featured: Boolean(post.featured),
    content: normalizeBlogContent(post.content),
  };
}

function mapGeneratedDesign(design: BackendGeneratedDesign): GeneratedDesign {
  return {
    id: design.id,
    title: design.title,
    description: design.description,
    style: design.style as GeneratedDesign["style"],
    previewImage: design.previewImage || design.previewImageUrl || "",
    estimatedTotal: design.estimatedTotal,
    currency: design.currency,
    budgetStatus: design.budgetStatus,
    designNotes: Array.isArray(design.designNotes) ? design.designNotes : [],
    products: (design.products ?? []).map((product) => ({
      id: product.id,
      name: product.name,
      category: asItemCategory(product.category),
      price: Number(product.price ?? 0),
      currency: String(product.currency ?? design.currency),
      quantity: Number(product.quantity ?? 1),
      locationAvailability: Boolean(product.locationAvailability ?? true),
      image: String(product.image ?? product.imageUrl ?? ""),
      description: String(product.description ?? ""),
      included: Boolean(product.included ?? true),
    })),
  };
}

/* ---------------------------------------------------------------------- */
/* Design generation                                                       */
/* ---------------------------------------------------------------------- */

/**
 * POST /api/designs/generate
 * Returns AI-composed design concepts tailored to the payload.
 */
export async function generateDesigns(
  payload: DesignGenerationPayload
): Promise<ApiResponse<{ designRequestId: string, designs: GeneratedDesign[] }>> {
  const response = await backendRequest<BackendGenerateResponse>("/api/designs/generate", {
    method: "POST",
    body: {
      designType: toDesignType(payload.designType),
      spaceType: payload.spaceType,
      description: payload.description,
      imageName: payload.imageName,
      uploadedImageUrl: payload.uploadedImageUrl,
      uploadedImageKey: payload.uploadedImageKey,
      style: payload.style,
      mood: payload.mood,
      colorPreferences: payload.colorPreferences,
      budget: payload.budget,
      currency: payload.currency,
      location: payload.location,
      timeline: payload.timeline,
      selectedItems: payload.selectedItems,
      extraNotes: payload.extraNotes,
      paymentId: payload.paymentId,
      stripeCheckoutSessionId: payload.stripeCheckoutSessionId,
    },
  });

  const designs = (response.data.designs ?? []).map(mapGeneratedDesign);
  for (const design of response.data.designs ?? []) {
    designRequestIdByDesignId.set(design.id, response.data.designRequestId);
  }

  return {
    success: true,
    data: {
      designRequestId: response.data.designRequestId,
      designs
    },
    message: "Designs generated successfully.",
  };
}

export async function getImageStatus(designRequestId: string) {
  return backendRequest<{ imageGenerationStatus: string, designs: { id: string, previewImageUrl: string | null }[] }>(
    `/api/designs/${designRequestId}/images-status`
  );
}

/** GET /api/user/free-generation-status */
export async function getFreeGenerationStatus(): Promise<ApiResponse<FreeGenerationStatus>> {
  const response = await backendRequest<FreeGenerationStatus>("/api/user/free-generation-status");
  return {
    success: true,
    data: {
      hasUsedFreeGeneration: Boolean(
        response.data.hasUsedFreeGeneration ?? response.data.freeGenerationUsed
      ),
      generationsUsed: Number(response.data.generationsUsed ?? 0),
      canUseFreeGeneration: response.data.canUseFreeGeneration,
      freeGenerationUsed: response.data.freeGenerationUsed,
      requiresPayment: response.data.requiresPayment,
    },
  };
}

/** POST /api/payments/create-checkout-session */
export async function createCheckoutSession(
  payload: CheckoutSessionPayload
): Promise<ApiResponse<CheckoutSessionResponse>> {
  const response = await backendRequest<CheckoutSessionResponse>(
    "/api/payments/create-checkout-session",
    {
      method: "POST",
      body: {
        amount: payload.amount,
        currency: payload.currency ?? "USD",
        designRequestDraft: payload.designRequestDraft,
        designGenerationPayload: payload.designGenerationPayload,
      },
    }
  );
  return {
    success: true,
    data: response.data,
  };
}

/** POST /api/uploads */
export async function uploadImage(file: File): Promise<ApiResponse<UploadedImageRef>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await backendRequest<UploadedImageRef>("/api/uploads", {
    method: "POST",
    body: formData,
  });

  return {
    success: true,
    data: {
      imageUrl: String(response.data.imageUrl),
      imageKey: String(response.data.imageKey),
    },
  };
}

/* ---------------------------------------------------------------------- */
/* Product search                                                          */
/* ---------------------------------------------------------------------- */

/**
 * POST /api/products/search
 * Returns products matching the user's location, selected items, and budget.
 */
export async function getAvailableProducts(
  location: LocationInfo,
  selectedItems: SelectedItem[],
  budget: number
): Promise<ApiResponse<Product[]>> {
  const response = await backendRequest<{ products: Product[] }>("/api/products/search", {
    method: "POST",
    body: {
      location,
      selectedItems,
      budget,
      designType: "INTERIOR",
      spaceType: "living-room",
    },
  });

  return { success: true, data: response.data.products ?? [] };
}

/* ---------------------------------------------------------------------- */
/* Design selection                                                        */
/* ---------------------------------------------------------------------- */

/**
 * POST /api/designs/select
 * Records the user's chosen design + included products + contact details.
 */
export async function submitSelectedDesign(
  payload: SelectedDesignPayload
): Promise<ApiResponse<{ referenceId: string }>> {
  const designRequestId = designRequestIdByDesignId.get(payload.designId);
  if (!designRequestId) {
    throw new Error("Could not find the parent design request. Please generate designs again.");
  }

  const response = await backendRequest<{
    referenceId: string;
    message?: string;
  }>("/api/designs/select", {
    method: "POST",
    body: {
      designRequestId,
      generatedDesignId: payload.designId,
      selectedProducts: payload.includedProductIds.map((id) => ({ id, included: true })),
      customerName: payload.contact.name,
      customerEmail: payload.contact.email,
      customerPhone: payload.contact.phone,
      preferredContactTime: payload.contact.preferredContactTime,
    },
  });

  return {
    success: true,
    data: { referenceId: response.data.referenceId },
    message: response.data.message ?? "Your design selection has been received.",
  };
}

/* ---------------------------------------------------------------------- */
/* Booking                                                                 */
/* ---------------------------------------------------------------------- */

/** POST /api/bookings */
export async function submitBooking(
  payload: BookingFormData
): Promise<ApiResponse<{ bookingId: string }>> {
  const messageWithReference = payload.designReference
    ? `${payload.message ?? ""}\n\nDesign reference: ${payload.designReference}`.trim()
    : payload.message;

  const response = await backendRequest<{ bookingId: string; message?: string }>("/api/bookings", {
    method: "POST",
    body: {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      projectType: payload.projectType,
      preferredDate: payload.preferredDate,
      preferredTime: payload.preferredTime,
      location: payload.location,
      budgetRange: payload.budgetRange,
      message: messageWithReference,
    },
  });

  return {
    success: true,
    data: { bookingId: response.data.bookingId },
    message: response.data.message ?? "Your consultation request has been received.",
  };
}

/* ---------------------------------------------------------------------- */
/* Contact                                                                 */
/* ---------------------------------------------------------------------- */

/** POST /api/contact */
export async function submitContact(
  payload: ContactFormData
): Promise<ApiResponse<{ ticketId: string }>> {
  const response = await backendRequest<{ ticketId: string; message?: string }>("/api/contact", {
    method: "POST",
    body: payload,
  });

  return {
    success: true,
    data: { ticketId: response.data.ticketId },
    message: response.data.message ?? "Thanks for reaching out. We'll reply shortly.",
  };
}

/* ---------------------------------------------------------------------- */
/* Blogs                                                                   */
/* ---------------------------------------------------------------------- */

/** GET /api/blogs */
export async function getBlogs(): Promise<ApiResponse<BlogPost[]>> {
  const response = await backendRequest<any[]>("/api/blogs");
  return { success: true, data: (response.data ?? []).map(mapBlogPost) };
}

/** GET /api/blogs/:slug */
export async function getBlogBySlugApi(
  slug: string
): Promise<ApiResponse<BlogPost | null>> {
  try {
    const response = await backendRequest<any>(`/api/blogs/${encodeURIComponent(slug)}`);
    return { success: true, data: mapBlogPost(response.data) };
  } catch {
    return { success: true, data: null };
  }
}
