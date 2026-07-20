"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@/lib/validation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { consumeRedirectIntent } from "@/lib/services/redirect";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/Button";

const labelClass = "mb-1.5 block text-sm font-medium text-ink-800";
const fieldClass =
  "h-12 w-full rounded-2xl border border-sand-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-400 focus-ring";
const errorClass = "mt-1 text-sm text-red-600";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data);
      const dest = consumeRedirectIntent() ?? "/account";
      router.push(dest);
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "We couldn't log you in. Please try again.",
        "error"
      );
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="login-email" className={labelClass}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            aria-invalid={!!errors.email}
            className={fieldClass}
            {...register("email")}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <PasswordInput
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between gap-4">
          <label
            htmlFor="login-remember"
            className="flex cursor-pointer items-center gap-2 text-sm text-ink-700"
          >
            <input
              id="login-remember"
              type="checkbox"
              className="h-4 w-4 rounded border-sand-300 text-ink-900 focus-ring"
              {...register("rememberMe")}
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="focus-ring rounded text-sm font-medium text-gold-dark hover:text-ink-900"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Logging in…" : "Log In"}
        </Button>
      </form>

      <SocialAuthButtons verb="Continue" />

      <p className="text-center text-sm text-ink-500">
        New to Auralis?{" "}
        <Link
          href="/signup"
          className="focus-ring rounded font-medium text-gold-dark hover:text-ink-900"
        >
          Create account
        </Link>
      </p>
    </div>
  );
}
