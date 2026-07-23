import { backendRequest } from "./http";
import type {
  AccountOverview,
  ApiResponse,
  CustomerBooking,
  CustomerDesignRequest,
  CustomerPayment,
  FreeGenerationStatus,
  RecentActivity,
} from "../types";

type BackendGeneratedDesign = CustomerDesignRequest["generatedDesigns"][number];

function mapGeneratedDesign(design: any): BackendGeneratedDesign {
  return {
    id: String(design.id),
    title: String(design.title ?? "Untitled concept"),
    description: String(design.description ?? ""),
    style: String(design.style ?? "modern") as BackendGeneratedDesign["style"],
    previewImage: String(design.previewImage ?? design.previewImageUrl ?? ""),
    estimatedTotal: Number(design.estimatedTotal ?? 0),
    currency: String(design.currency ?? "USD"),
    budgetStatus: (design.budgetStatus ?? "premium-option") as BackendGeneratedDesign["budgetStatus"],
    designNotes: Array.isArray(design.designNotes) ? design.designNotes.map(String) : [],
    products: Array.isArray(design.products)
      ? design.products.map((product: any) => ({
          id: String(product.id ?? product.productId ?? ""),
          name: String(product.name ?? "Unnamed product"),
          category:
            product.category === "furniture" ||
            product.category === "decor" ||
            product.category === "lighting" ||
            product.category === "exterior"
              ? product.category
              : "decor",
          price: Number(product.price ?? 0),
          currency: String(product.currency ?? design.currency ?? "USD"),
          quantity: Number(product.quantity ?? 1),
          locationAvailability: Boolean(product.locationAvailability ?? true),
          image: String(product.image ?? product.imageUrl ?? ""),
          description: String(product.description ?? ""),
          included: Boolean(product.included ?? true),
        }))
      : [],
  };
}

function mapDetailToCustomerDesignRequest(payload: any): CustomerDesignRequest {
  const request = payload?.designRequest ?? {};
  const generatedDesigns = Array.isArray(payload?.generatedDesigns)
    ? payload.generatedDesigns.map(mapGeneratedDesign)
    : Array.isArray(request.designs)
      ? request.designs.map(mapGeneratedDesign)
      : [];

  return {
    id: String(request.id ?? ""),
    createdAt: String(request.createdAt ?? new Date().toISOString()),
    status: String(request.status ?? "draft").toLowerCase().replace("_", "-") as CustomerDesignRequest["status"],
    designType: (String(request.designType ?? "interior").toLowerCase() === "exterior" ? "exterior" : "interior") as CustomerDesignRequest["designType"],
    spaceType: String(request.spaceType ?? "other") as CustomerDesignRequest["spaceType"],
    style: String(request.style ?? "modern") as CustomerDesignRequest["style"],
    budget: Number(request.budget ?? 0),
    currency: String(request.currency ?? "USD"),
    location: {
      city: String(request.city ?? ""),
      state: request.state ? String(request.state) : undefined,
      country: String(request.country ?? ""),
      zip: request.postalCode ? String(request.postalCode) : undefined,
    },
    description: request.description ? String(request.description) : undefined,
    imageName: request.uploadedImageUrl ? String(request.uploadedImageUrl) : undefined,
    selectedItems: Array.isArray(request.selectedItems)
      ? request.selectedItems.map((item: any) => ({
          id: String(item.id ?? ""),
          label: String(item.label ?? item.itemType ?? "Item"),
          category:
            item.category === "furniture" ||
            item.category === "decor" ||
            item.category === "lighting" ||
            item.category === "exterior"
              ? item.category
              : "decor",
        }))
      : [],
    generatedDesigns,
    selectedDesignId:
      typeof payload?.selectedDesign?.generatedDesignId === "string"
        ? payload.selectedDesign.generatedDesignId
        : undefined,
  };
}

async function withFallback<T>(
  task: () => Promise<ApiResponse<T>>,
  fallbackData: T
): Promise<ApiResponse<T>> {
  try {
    return await task();
  } catch {
    return { success: false, data: fallbackData };
  }
}

export const accountService = {
  /** GET /api/account/overview */
  async getAccountOverview(): Promise<ApiResponse<AccountOverview>> {
    return withFallback(async () => {
      const response = await backendRequest<any>("/api/account/overview");
      const recentActivity: RecentActivity[] = [
        ...(response.data.recentDesignRequests ?? []).map((item: any) => ({
          id: String(item.id),
          label: `Design request ${item.id} is ${String(item.status ?? "updated").toLowerCase()}`,
          date: String(item.createdAt ?? new Date().toISOString()),
          type: "design" as const,
        })),
        ...(response.data.recentBookings ?? []).map((item: any) => ({
          id: String(item.id),
          label: `Booking ${item.id} is ${String(item.status ?? "updated").toLowerCase()}`,
          date: String(item.createdAt ?? new Date().toISOString()),
          type: "booking" as const,
        })),
        ...(response.data.recentPayments ?? []).map((item: any) => ({
          id: String(item.id),
          label: `Payment ${item.id} is ${String(item.status ?? "pending").toLowerCase()}`,
          date: String(item.createdAt ?? new Date().toISOString()),
          type: "payment" as const,
        })),
      ]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 8);

      return {
        success: true,
        data: {
          customerName: String(response.data.userProfile?.name ?? "there"),
          freeGenerationUsed: Boolean(response.data.freeGenerationStatus?.hasUsedFreeGeneration),
          totalDesignRequests: Number(response.data.totalDesignRequests ?? 0),
          savedDesigns: Number(response.data.completedDesignRequests ?? 0),
          selectedDesignTitle: undefined,
          upcomingBookings: Number(response.data.upcomingBookingsCount ?? 0),
          recentActivity,
        },
      };
    }, {
      customerName: "there",
      freeGenerationUsed: false,
      totalDesignRequests: 0,
      savedDesigns: 0,
      selectedDesignTitle: undefined,
      upcomingBookings: 0,
      recentActivity: [],
    });
  },

  /** GET /api/account/design-requests */
  async getMyDesignRequests(): Promise<ApiResponse<CustomerDesignRequest[]>> {
    return withFallback(async () => {
      const response = await backendRequest<{ items: Array<{ id: string; createdAt: string }> }>(
        "/api/account/design-requests"
      );
      const ids = (response.data.items ?? []).map((item) => String(item.id));
      const details = await Promise.all(
        ids.map(async (id) => {
          try {
            const detail = await backendRequest<any>(`/api/account/design-requests/${id}`);
            const mapped = mapDetailToCustomerDesignRequest(detail.data);
            const createdAt = response.data.items.find((item) => String(item.id) === id)?.createdAt;
            return { ...mapped, createdAt: createdAt ?? mapped.createdAt };
          } catch {
            return null;
          }
        })
      );
      return {
        success: true,
        data: details.filter((item): item is CustomerDesignRequest => item !== null),
      };
    }, []);
  },

  /** GET /api/account/design-requests/:id */
  async getDesignRequestById(
    id: string
  ): Promise<ApiResponse<CustomerDesignRequest | null>> {
    return withFallback(async () => {
      const response = await backendRequest<any>(`/api/account/design-requests/${id}`);
      return {
        success: true,
        data: mapDetailToCustomerDesignRequest(response.data),
      };
    }, null);
  },

  /** GET /api/account/bookings */
  async getMyBookings(): Promise<ApiResponse<CustomerBooking[]>> {
    return withFallback(async () => {
      const response = await backendRequest<any[]>("/api/account/bookings");
      const mapped: CustomerBooking[] = (response.data ?? []).map((item) => ({
        id: String(item.id),
        createdAt: String(item.createdAt ?? new Date().toISOString()),
        preferredDate: String(item.preferredDate ?? ""),
        preferredTime: String(item.preferredTime ?? ""),
        projectType:
          item.projectType === "interior" || item.projectType === "exterior"
            ? item.projectType
            : "consultation",
        status:
          item.status === "requested"
            ? "pending"
            : item.status === "confirmed" || item.status === "completed" || item.status === "cancelled"
              ? item.status
              : "pending",
        designReference: undefined,
        location: [item.city, item.state, item.country].filter(Boolean).join(", "),
        message: item.message ? String(item.message) : undefined,
      }));
      return { success: true, data: mapped };
    }, []);
  },

  /** GET /api/account/payments */
  async getMyPayments(): Promise<ApiResponse<CustomerPayment[]>> {
    return withFallback(async () => {
      const response = await backendRequest<any[]>("/api/account/payments");
      const mapped: CustomerPayment[] = (response.data ?? []).map((item) => ({
        id: String(item.id),
        date: String(item.createdAt ?? new Date().toISOString()),
        description: item.designRequestId
          ? `Design generation for ${String(item.designRequestId)}`
          : "Design generation payment",
        amount: Number(item.amount ?? 0),
        currency: String(item.currency ?? "USD"),
        status:
          Number(item.amount ?? 0) === 0
            ? "free"
            : item.status === "paid" || item.status === "pending" || item.status === "failed"
              ? item.status
              : "pending",
        type: Number(item.amount ?? 0) === 0 ? "free-generation" : "paid-generation",
      }));
      return { success: true, data: mapped };
    }, []);
  },

  /** GET /api/user/free-generation-status */
  async getFreeGenerationStatus(): Promise<ApiResponse<FreeGenerationStatus>> {
    return withFallback(async () => {
      const response = await backendRequest<FreeGenerationStatus>("/api/user/free-generation-status");
      return {
        success: true,
        data: {
          hasUsedFreeGeneration: Boolean(response.data.hasUsedFreeGeneration),
          generationsUsed: Number(response.data.generationsUsed ?? 0),
        },
      };
    }, {
      hasUsedFreeGeneration: false,
      generationsUsed: 0,
    });
  },
};
