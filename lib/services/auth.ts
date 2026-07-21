import { backendRequest } from "./http";
import type {
  ApiResponse,
  ChangePasswordPayload,
  Customer,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "../types";

type BackendFreeGenerationStatus = {
  hasUsedFreeGeneration?: boolean;
};

type BackendAuthPayload = {
  user?: Record<string, unknown>;
  freeGenerationStatus?: BackendFreeGenerationStatus;
  authenticated?: boolean;
};

let cachedCustomer: Customer | null = null;

export function readSession(): Customer | null {
  return cachedCustomer;
}

function writeSession(customer: Customer | null) {
  cachedCustomer = customer;
}

const SESSION_COOKIE_NAME = "auralis_session";
const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function browserCookieAttributes(): string {
  if (typeof window === "undefined") return "Path=/; SameSite=Lax";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  return `Path=/; SameSite=Lax${secure}`;
}

function setBrowserCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${browserCookieAttributes()}; Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}`;
}

function clearBrowserCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0`;
}

function syncBrowserSession(customer: Customer | null): void {
  if (!customer?.id) {
    clearBrowserCookie(SESSION_COOKIE_NAME);
    return;
  }

  setBrowserCookie(SESSION_COOKIE_NAME, customer.id);
}

function toCustomer(
  user: Record<string, unknown>,
  freeGenerationStatus?: BackendFreeGenerationStatus
): Customer {
  return {
    id: String(user.id ?? ""),
    name: String(user.name ?? ""),
    email: String(user.email ?? ""),
    phone: String(user.phone ?? ""),
    emailVerified: Boolean(user.emailVerified),
    freeGenerationUsed: Boolean(freeGenerationStatus?.hasUsedFreeGeneration),
    createdAt: String(user.createdAt ?? new Date().toISOString()),
    role: user.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    status:
      user.status === "SUSPENDED"
        ? "SUSPENDED"
        : user.status === "DELETED"
          ? "DELETED"
          : "ACTIVE",
    avatarUrl: typeof user.image === "string" ? user.image : undefined,
    country: typeof user.country === "string" ? user.country : undefined,
    city: typeof user.city === "string" ? user.city : undefined,
    state: typeof user.state === "string" ? user.state : undefined,
    address: typeof user.address === "string" ? user.address : undefined,
    preferredStyle: typeof user.preferredStyle === "string" ? (user.preferredStyle as Customer["preferredStyle"]) : undefined,
    preferredContactTime:
      typeof user.preferredContactTime === "string" ? user.preferredContactTime : undefined,
    marketingOptIn: Boolean(user.marketingOptIn),
  };
}

function tokenFromCurrentUrl(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const token = new URLSearchParams(window.location.search).get("token");
  return token ?? undefined;
}

/* ------------------------------ authService --------------------------- */

export const authService = {
  /** POST /api/auth/login */
  async login(payload: LoginPayload): Promise<ApiResponse<Customer>> {
    const response = await backendRequest<BackendAuthPayload>("/api/auth/login", {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
      },
    });
    const user = response.data.user;
    if (!user) {
      throw new Error("Login succeeded but no user profile was returned.");
    }
    const customer = toCustomer(user, response.data.freeGenerationStatus);
    writeSession(customer);
    syncBrowserSession(customer);
    return { success: true, data: customer, message: "Welcome back." };
  },

  /** POST /api/auth/register */
  async signup(payload: SignupPayload): Promise<ApiResponse<Customer>> {
    const response = await backendRequest<BackendAuthPayload>("/api/auth/register", {
      method: "POST",
      body: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        marketingOptIn: payload.marketingOptIn ?? false,
      },
    });
    const user = response.data.user;
    if (!user) {
      throw new Error("Signup succeeded but no user profile was returned.");
    }
    const customer = toCustomer(user, response.data.freeGenerationStatus);
    writeSession(customer);
    syncBrowserSession(customer);
    return {
      success: true,
      data: customer,
      message: "Account created. Please verify your email.",
    };
  },

  /** POST /api/auth/logout */
  async logout(): Promise<ApiResponse<null>> {
    try {
      await backendRequest<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
    } catch {
      // Treat logout as best effort and always clear local auth state.
    }
    writeSession(null);
    syncBrowserSession(null);
    return { success: true, data: null };
  },

  /** GET /api/auth/me */
  async getCurrentUser(): Promise<ApiResponse<Customer | null>> {
    const response = await backendRequest<BackendAuthPayload>("/api/auth/me");
    if (!response.data.authenticated || !response.data.user) {
      writeSession(null);
      syncBrowserSession(null);
      return { success: true, data: null };
    }
    const customer = toCustomer(response.data.user, response.data.freeGenerationStatus);
    writeSession(customer);
    syncBrowserSession(customer);
    return { success: true, data: customer };
  },

  /** POST /api/auth/forgot-password */
  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<ApiResponse<null>> {
    const response = await backendRequest<{ message?: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: { email: payload.email },
    });
    return {
      success: true,
      data: null,
      message:
        response.data.message ??
        "Password reset instructions have been sent if this email exists.",
    };
  },

  /** POST /api/auth/reset-password */
  async resetPassword(
    payload: ResetPasswordPayload
  ): Promise<ApiResponse<null>> {
    const token = payload.token ?? tokenFromCurrentUrl();
    if (!token) {
      throw new Error("Reset token is missing or invalid.");
    }

    const response = await backendRequest<{ message?: string }>("/api/auth/reset-password", {
      method: "POST",
      body: {
        token,
        newPassword: payload.password,
      },
    });

    return {
      success: true,
      data: null,
      message: response.data.message ?? "Your password has been reset. You can now log in.",
    };
  },

  /** POST /api/auth/resend-verification */
  async resendVerificationEmail(): Promise<ApiResponse<null>> {
    const response = await backendRequest<{ message?: string }>("/api/auth/resend-verification", {
      method: "POST",
      body: {
        email: cachedCustomer?.email,
      },
    });
    return {
      success: true,
      data: null,
      message: response.data.message ?? "Verification email sent. Please check your inbox.",
    };
  },

  async confirmEmailVerified(token?: string): Promise<ApiResponse<Customer | null>> {
    if (token) {
      await backendRequest<{ message?: string }>("/api/auth/verify-email", {
        method: "POST",
        body: { token },
      });
    }
    return this.getCurrentUser();
  },

  /** PATCH /api/account/profile */
  async updateProfile(
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<Customer | null>> {
    const response = await backendRequest<{ profile: Record<string, unknown> }>("/api/account/profile", {
      method: "PATCH",
      body: {
        name: payload.name,
        phone: payload.phone,
        city: payload.city,
        state: payload.state,
        country: payload.country,
        address: payload.address,
        preferredStyle: payload.preferredStyle,
        preferredContactTime: payload.preferredContactTime,
      },
    });

    const updated = toCustomer(response.data.profile, {
      hasUsedFreeGeneration: cachedCustomer?.freeGenerationUsed,
    });
    writeSession(updated);
    syncBrowserSession(updated);
    return { success: true, data: updated, message: "Profile updated." };
  },

  /** PATCH /api/account/password */
  async changePassword(
    payload: ChangePasswordPayload
  ): Promise<ApiResponse<null>> {
    const response = await backendRequest<{ message?: string }>("/api/account/password", {
      method: "PATCH",
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      },
    });
    return {
      success: true,
      data: null,
      message: response.data.message ?? "Password changed.",
    };
  },

  /** Local state helper used to reflect free-generation usage instantly in the UI. */
  markFreeGenerationUsed(): Customer | null {
    const current = cachedCustomer;
    if (!current) return null;
    const updated = { ...current, freeGenerationUsed: true };
    writeSession(updated);
    return updated;
  },

  persist(customer: Customer) {
    writeSession(customer);
    syncBrowserSession(customer);
  },
};
