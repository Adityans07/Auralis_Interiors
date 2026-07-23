"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/lib/validation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password") ?? "";

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      await resetPassword(data);
      setDone(true);
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "We couldn't reset your password. Please try again.",
        "error"
      );
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-glow"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <ShieldCheck className="h-7 w-7" aria-hidden />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-foreground">
          Password reset
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your password has been reset.
        </p>
        <Button href="/login" className="mt-6">
          Back to login
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <PasswordInput
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          placeholder="Create a new password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter password={passwordValue} />
      </div>

      <PasswordInput
        id="reset-confirm-password"
        label="Confirm new password"
        autoComplete="new-password"
        placeholder="Re-enter your new password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
