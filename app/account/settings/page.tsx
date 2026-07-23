"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LogOut } from "lucide-react";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "@/lib/validation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { customer, changePassword, logout } = useAuth();
  const { toast } = useToast();

  const [marketingOptIn, setMarketingOptIn] = useState(
    customer?.marketingOptIn ?? false
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onChangePassword = async (data: ChangePasswordSchema) => {
    try {
      const message = await changePassword(data);
      toast(message || "Password updated.", "success");
      reset();
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not change your password.",
        "error"
      );
    }
  };

  const toggleMarketing = () => {
    setMarketingOptIn((prev) => {
      const next = !prev;
      toast(
        next
          ? "You're now subscribed to product updates."
          : "You've unsubscribed from product updates.",
        "info"
      );
      return next;
    });
  };

  const handleDelete = () => {
    setConfirmingDelete(false);
    toast("Account deletion is disabled in this demo.", "info");
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-base/5 p-6 shadow-glow sm:p-8">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground sm:text-3xl">
            Settings
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your password, email preferences, and account.
          </p>
        </div>
      </div>

      {/* Change password */}
      <section className="rounded-3xl border border-white/10 bg-base/5 p-6 shadow-glow sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Change password
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Use at least 8 characters for your new password.
        </p>

        <form
          onSubmit={handleSubmit(onChangePassword)}
          noValidate
          className="mt-5 max-w-md space-y-4"
        >
          <PasswordInput
            id="current-password"
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <PasswordInput
            id="new-password"
            label="New password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordInput
            id="confirm-password"
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      {/* Email preferences */}
      <section className="rounded-3xl border border-white/10 bg-base/5 p-6 shadow-glow sm:p-8">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Email preferences
        </h2>
        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Product updates &amp; design inspiration
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Occasional emails about new features and curated ideas.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={marketingOptIn}
            aria-label="Toggle marketing emails"
            onClick={toggleMarketing}
            className={cn(
              "focus-ring relative h-6 w-11 shrink-0 rounded-full transition-colors",
              marketingOptIn ? "bg-white/10" : "bg-sand-300"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-base shadow transition-transform",
                marketingOptIn ? "translate-x-[22px]" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="rounded-3xl border border-red-200 bg-red-50/60 p-6 shadow-glow sm:p-8">
        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-red-700">
          <AlertTriangle className="h-5 w-5" aria-hidden /> Danger zone
        </h2>
        <p className="mt-1 text-sm text-red-700/80">
          Deleting your account is permanent and cannot be undone.
        </p>

        {confirmingDelete ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-red-700">
              Are you sure you want to delete your account?
            </p>
            <button
              type="button"
              onClick={handleDelete}
              className="focus-ring inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="focus-ring inline-flex items-center rounded-full border border-white/10 bg-base px-4 py-2 text-sm font-medium text-foreground/90 transition-colors hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="focus-ring mt-5 inline-flex items-center rounded-full border border-red-300 bg-base px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
          >
            Delete account
          </button>
        )}
      </section>

      {/* Log out */}
      <section className="rounded-3xl border border-white/10 bg-base/5 p-6 shadow-glow sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Log out
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign out of your account on this device.
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden /> Log out
          </Button>
        </div>
      </section>
    </div>
  );
}
