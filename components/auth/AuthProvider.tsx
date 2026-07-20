"use client";

/** Frontend auth context backed by backend session APIs. */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AuthStatus,
  ChangePasswordPayload,
  Customer,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "@/lib/types";
import { authService } from "@/lib/services/auth";

interface AuthContextValue {
  customer: Customer | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<Customer>;
  signup: (payload: SignupPayload) => Promise<Customer>;
  logout: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordPayload) => Promise<string>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<string>;
  resendVerificationEmail: () => Promise<string>;
  confirmEmailVerified: (token?: string) => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<Customer>;
  changePassword: (payload: ChangePasswordPayload) => Promise<string>;
  /** Flag the free generation as used for the logged-in customer. */
  markFreeGenerationUsed: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Hydrate from the backend session on mount.
  useEffect(() => {
    let active = true;
    authService
      .getCurrentUser()
      .then((res) => {
        if (!active) return;
        setCustomer(res.data);
        setStatus(res.data ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setCustomer(null);
        setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await authService.login(payload);
    setCustomer(res.data);
    setStatus("authenticated");
    return res.data;
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const res = await authService.signup(payload);
    setCustomer(res.data);
    setStatus("authenticated");
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setCustomer(null);
    setStatus("unauthenticated");
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordPayload) => {
    const res = await authService.forgotPassword(payload);
    return res.message ?? "";
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    const res = await authService.resetPassword(payload);
    return res.message ?? "";
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    const res = await authService.resendVerificationEmail();
    return res.message ?? "";
  }, []);

  const confirmEmailVerified = useCallback(async (token?: string) => {
    const res = await authService.confirmEmailVerified(token);
    if (res.data) setCustomer(res.data);
  }, []);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    const res = await authService.updateProfile(payload);
    if (res.data) setCustomer(res.data);
    return res.data as Customer;
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordPayload) => {
    const res = await authService.changePassword(payload);
    return res.message ?? "";
  }, []);

  const markFreeGenerationUsed = useCallback(() => {
    const updated = authService.markFreeGenerationUsed();
    if (updated) setCustomer(updated);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      status,
      isAuthenticated: status === "authenticated",
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      resendVerificationEmail,
      confirmEmailVerified,
      updateProfile,
      changePassword,
      markFreeGenerationUsed,
    }),
    [
      customer,
      status,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      resendVerificationEmail,
      confirmEmailVerified,
      updateProfile,
      changePassword,
      markFreeGenerationUsed,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>.");
  return ctx;
}
