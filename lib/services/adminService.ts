import { backendRequest } from "./http";
import type {
  AdminAiLog,
  AdminBlogPayload,
  AdminBlogPost,
  AdminBookingListItem,
  AdminContactMessage,
  AdminCustomerDetail,
  AdminCustomerListItem,
  AdminDashboardResponse,
  AdminDesignRequestDetail,
  AdminDesignRequestListItem,
  AdminGeneratedDesignListItem,
  AdminPayment,
  AdminProduct,
  AdminProductPayload,
  AdminSelectedDesignListItem,
  AdminSettings,
  PaginatedResponse,
  PaginationParams,
} from "@/lib/types/admin";

function toQuery(params?: PaginationParams): string {
  if (!params) return "";
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export async function getAdminDashboard() {
  return backendRequest<AdminDashboardResponse>("/api/admin/dashboard");
}

export async function getAdminDesignRequests(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminDesignRequestListItem>>(
    `/api/admin/design-requests${toQuery(params)}`
  );
}

export async function getAdminDesignRequestById(id: string) {
  return backendRequest<AdminDesignRequestDetail>(`/api/admin/design-requests/${id}`);
}

export async function updateAdminDesignRequest(
  id: string,
  payload: {
    status?: string;
    priority?: string;
    assignedToId?: string | null;
    internalStatus?: string | null;
  }
) {
  return backendRequest(`/api/admin/design-requests/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function addAdminNote(payload: {
  entityType: string;
  entityId: string;
  note: string;
}) {
  const map: Record<string, string> = {
    DESIGN_REQUEST: `/api/admin/design-requests/${payload.entityId}/notes`,
    SELECTED_DESIGN: `/api/admin/selected-designs/${payload.entityId}/notes`,
    BOOKING: `/api/admin/bookings/${payload.entityId}/notes`,
    CUSTOMER: `/api/admin/customers/${payload.entityId}/notes`,
    CONTACT_MESSAGE: `/api/admin/contact-messages/${payload.entityId}/notes`,
  };
  const url = map[payload.entityType] ?? `/api/admin/design-requests/${payload.entityId}/notes`;
  return backendRequest(url, {
    method: "POST",
    body: payload,
  });
}

export async function getAdminGeneratedDesigns(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminGeneratedDesignListItem>>(
    `/api/admin/generated-designs${toQuery(params)}`
  );
}

export async function getAdminSelectedDesigns(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminSelectedDesignListItem>>(
    `/api/admin/selected-designs${toQuery(params)}`
  );
}

export async function updateSelectedDesignStatus(id: string, status: string) {
  return backendRequest(`/api/admin/selected-designs/${id}`, {
    method: "PATCH",
    body: { status },
  });
}

export async function getAdminBookings(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminBookingListItem>>(
    `/api/admin/bookings${toQuery(params)}`
  );
}

export async function updateBookingStatus(
  id: string,
  payload: { status?: string; preferredDate?: string; preferredTime?: string }
) {
  return backendRequest(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function getAdminCustomers(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminCustomerListItem>>(
    `/api/admin/customers${toQuery(params)}`
  );
}

export async function getAdminCustomerById(id: string) {
  return backendRequest<AdminCustomerDetail>(`/api/admin/customers/${id}`);
}

export async function getAdminProducts(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminProduct>>(
    `/api/admin/products${toQuery(params)}`
  );
}

export async function createAdminProduct(payload: AdminProductPayload) {
  return backendRequest(`/api/admin/products`, {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminProduct(
  id: string,
  payload: Partial<AdminProductPayload> & { archived?: boolean }
) {
  return backendRequest(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteAdminProduct(id: string) {
  return backendRequest(`/api/admin/products/${id}`, { method: "DELETE" });
}

export async function archiveAdminProduct(id: string) {
  return backendRequest(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: { archived: true },
  });
}

export async function unarchiveAdminProduct(id: string) {
  return backendRequest(`/api/admin/products/${id}`, {
    method: "PATCH",
    body: { archived: false },
  });
}

export async function getAdminProductById(id: string) {
  return backendRequest<AdminProduct>(`/api/admin/products/${id}`);
}

export async function getAdminBlogs(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminBlogPost>>(`/api/admin/blogs${toQuery(params)}`);
}

export async function createAdminBlog(payload: AdminBlogPayload) {
  return backendRequest(`/api/admin/blogs`, {
    method: "POST",
    body: payload,
  });
}

export async function updateAdminBlog(
  id: string,
  payload: Partial<AdminBlogPayload> & { published?: boolean; archived?: boolean }
) {
  return backendRequest(`/api/admin/blogs/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteAdminBlog(id: string) {
  return backendRequest(`/api/admin/blogs/${id}`, { method: "DELETE" });
}

export async function archiveAdminBlog(id: string) {
  return backendRequest(`/api/admin/blogs/${id}`, {
    method: "PATCH",
    body: { archived: true },
  });
}

export async function unarchiveAdminBlog(id: string) {
  return backendRequest(`/api/admin/blogs/${id}`, {
    method: "PATCH",
    body: { archived: false },
  });
}

export async function getAdminBlogById(id: string) {
  return backendRequest<AdminBlogPost>(`/api/admin/blogs/${id}`);
}

export async function getAdminContactMessages(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminContactMessage>>(
    `/api/admin/contact-messages${toQuery(params)}`
  );
}

export async function updateContactMessageStatus(id: string, status: string) {
  return backendRequest(`/api/admin/contact-messages/${id}`, {
    method: "PATCH",
    body: { status },
  });
}

export async function getAdminPayments(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminPayment>>(`/api/admin/payments${toQuery(params)}`);
}

export async function getAdminAiLogs(params?: PaginationParams) {
  return backendRequest<PaginatedResponse<AdminAiLog>>(`/api/admin/ai-logs${toQuery(params)}`);
}

export async function getAdminSettings() {
  return backendRequest<AdminSettings>(`/api/admin/settings`);
}

export async function updateAdminSettings(payload: Partial<AdminSettings>) {
  return backendRequest<AdminSettings>(`/api/admin/settings`, {
    method: "PATCH",
    body: payload,
  });
}
