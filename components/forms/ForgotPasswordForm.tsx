"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MailCheck, ArrowLeft } from "lucide-react";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/lib/validation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground";
const fieldClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-base px-4 text-sm text-foreground placeholder:text-muted-foreground/80 focus-ring";
const errorClass = "mt-1 text-sm text-red-600";

export function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      const message = await forgotPassword({ email: data.email });
      setSentMessage(
        message ||
          "Password reset instructions have been sent if this email exists."
      );
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
        "error"
      );
    }
  };

  if (sentMessage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-glow"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <MailCheck className="h-7 w-7" aria-hidden />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-foreground">
          Check your inbox
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {sentMessage}
        </p>
        <Button variant="outline" href="/login" className="mt-6">
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="forgot-email" className={labelClass}>
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={!!errors.email}
          className={fieldClass}
          {...register("email")}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link
          href="/login"
          className="focus-ring rounded font-medium text-gold-dark hover:text-foreground"
        >
          Back to login
        </Link>
      </p>
    </form>
  );
}
