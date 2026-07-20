export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminDashboardStats {
  totalDesignRequests: number;
  newDesignRequestsToday: number;
  completedAiGenerations: number;
  failedAiGenerations: number;
  selectedDesigns: number;
  pendingBookings: number;
  confirmedBookings: number;
  contactMessagesUnread: number;
  totalCustomers: number;
  paidGenerations: number;
  estimatedRevenue: number;
  conversionRate: number;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  charts: {
    designRequestsOverTime: Array<{ date: string; count: number }>;
    popularStyles: Array<{ style: string; count: number }>;
    popularSpaceTypes: Array<{ spaceType: string; count: number }>;
  };
  recent: {
    designRequests: Array<{ id: string; customerName: string; status: string; createdAt: string }>;
    selectedDesigns: Array<{ id: string; customerName: string; status: string; createdAt: string }>;
    bookings: Array<{ id: string; name: string; status: string; createdAt: string }>;
    contactMessages: Array<{ id: string; name: string; status: string; createdAt: string }>;
    failedAiGenerations: Array<{
      id: string;
      designRequestId: string;
      errorCode?: string | null;
      errorMessage?: string | null;
      createdAt: string;
    }>;
  };
}

export interface AdminDesignRequestListItem {
  id: string;
  customer: { id?: string | null; name: string; email?: string | null };
  designType: string;
  spaceType: string;
  city: string;
  budget: number;
  currency: string;
  style: string;
  status: string;
  priority: string;
  freeGenerationApplied: boolean;
  assignedTo?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
}

export interface AdminDesignRequestDetail {
  designRequest: Record<string, unknown>;
  customer?: Record<string, unknown> | null;
  selectedDesign?: Record<string, unknown> | null;
  payment?: Record<string, unknown> | null;
  aiLogs: AdminAiLog[];
  notes: AdminNote[];
}

export interface AdminGeneratedDesignListItem {
  id: string;
  title: string;
  designRequestId: string;
  customerName: string;
  style: string;
  estimatedTotal: number;
  currency: string;
  budgetStatus: string;
  productCount: number;
  selected: boolean;
  createdAt: string;
}

export interface AdminSelectedDesignListItem {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  selectedDesignId: string;
  finalEstimatedTotal: number;
  status: string;
  preferredContactTime?: string | null;
  createdAt: string;
}

export interface AdminBookingListItem {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  projectType: string;
  preferredDate: string;
  preferredTime: string;
  city: string;
  budgetRange: string;
  status: string;
  selectedDesignId?: string | null;
  createdAt: string;
}

export interface AdminCustomerListItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  status: string;
  emailVerified: boolean;
  freeGenerationUsed: boolean;
  totalDesignRequests: number;
  totalBookings: number;
  totalPayments: number;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface AdminCustomerDetail {
  customer: Record<string, unknown>;
  designRequests: Array<Record<string, unknown>>;
  selectedDesigns: Array<Record<string, unknown>>;
  bookings: Array<Record<string, unknown>>;
  payments: Array<Record<string, unknown>>;
  contactHistory: Array<Record<string, unknown>>;
  notes: AdminNote[];
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string | null;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  brand?: string | null;
  material?: string | null;
  color?: string | null;
  styleTags: string[];
  itemType: string;
  roomTypes: string[];
  designTypes: string[];
  city: string;
  state?: string | null;
  country: string;
  postalCode?: string | null;
  stockStatus: "IN_STOCK" | "LIMITED" | "OUT_OF_STOCK";
  vendorName?: string | null;
  vendorUrl?: string | null;
  archivedAt?: string | null;
}

export type AdminProductPayload = Omit<AdminProduct, "id" | "archivedAt">;

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  category: string;
  tags: string[];
  published: boolean;
  publishedAt?: string | null;
  archivedAt?: string | null;
  updatedAt?: string;
}

export type AdminBlogPayload = Omit<AdminBlogPost, "id" | "publishedAt" | "archivedAt" | "updatedAt">;

export interface AdminContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message?: string;
  messagePreview?: string;
  status: "NEW" | "READ" | "REPLIED";
  readAt?: string | null;
  repliedAt?: string | null;
  createdAt: string;
}

export interface AdminPayment {
  id: string;
  customer?: { id?: string | null; name: string; email?: string | null } | null;
  designRequestId?: string | null;
  stripeSessionId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  createdAt: string;
}

export interface AdminAiLog {
  id: string;
  designRequestId: string;
  status: "STARTED" | "COMPLETED" | "FAILED" | "RETRIED";
  errorCode?: string | null;
  errorMessage?: string | null;
  modelText?: string | null;
  modelImage?: string | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  totalTokens?: number | null;
  createdAt: string;
  completedAt?: string | null;
}

export interface AdminNote {
  id: string;
  entityType: string;
  entityId: string;
  note: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminSettings {
  businessName?: string;
  supportEmail?: string;
  supportPhone?: string;
  defaultCurrency?: string;
  paidGenerationPrice?: number;
  freeGenerationEnabled?: boolean;
  bookingAvailabilityNote?: string;
  adminNotificationEmail?: string;
  aiGenerationMode?: string;
  maintenanceMode?: boolean;
}
