"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginSchema } from "@/lib/validation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  return (
    <div className="min-h-screen bg-void px-4 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-base p-8 shadow-glow">
        <h1 className="text-2xl font-semibold text-foreground">Admin Login</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with an ADMIN account to access the portal.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(async (values) => {
            setError(null);
            try {
              const user = await login(values);
              if (user.role !== "ADMIN") {
                await logout();
                setError("This account does not have admin access.");
                return;
              }
              router.push("/admin");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Login failed.");
            }
          })}
        >
          <label className="block text-sm text-foreground/90">
            Email
            <input
              type="email"
              {...register("email")}
              className="mt-1 h-11 w-full rounded-xl border border-white/10 px-3 focus-ring"
            />
            {errors.email ? <span className="text-xs text-red-600">{errors.email.message}</span> : null}
          </label>

          <label className="block text-sm text-foreground/90">
            Password
            <input
              type="password"
              {...register("password")}
              className="mt-1 h-11 w-full rounded-xl border border-white/10 px-3 focus-ring"
            />
            {errors.password ? <span className="text-xs text-red-600">{errors.password.message}</span> : null}
          </label>

          {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
