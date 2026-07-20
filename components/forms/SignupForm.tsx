"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupSchema } from "@/lib/validation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/Button";

const labelClass = "mb-1.5 block text-sm font-medium text-ink-800";
const fieldClass =
  "h-12 w-full rounded-2xl border border-sand-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-400 focus-ring";
const errorClass = "mt-1 text-sm text-red-600";

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      marketingOptIn: false,
    },
  });

  const passwordValue = watch("password") ?? "";

  const onSubmit = async (data: SignupSchema) => {
    try {
      await signup(data);
      toast("Account created. Please verify your email.", "success");
      router.push("/verify-email");
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "We couldn't create your account. Please try again.",
        "error"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div>
        <label htmlFor="signup-name" className={labelClass}>
          Full name
        </label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Jane Doe"
          aria-invalid={!!errors.name}
          className={fieldClass}
          {...register("name")}
        />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="signup-email" className={labelClass}>
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          aria-invalid={!!errors.email}
          className={fieldClass}
          {...register("email")}
        />
        {errors.email && <p className={errorClass}>{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="signup-phone" className={labelClass}>
          Phone
        </label>
        <input
          id="signup-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 (415) 555-0142"
          aria-invalid={!!errors.phone}
          className={fieldClass}
          {...register("phone")}
        />
        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
      </div>

      <div>
        <PasswordInput
          id="signup-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          error={errors.password?.message}
          {...register("password")}
        />
        <PasswordStrengthMeter password={passwordValue} />
      </div>

      <PasswordInput
        id="signup-confirm-password"
        label="Confirm password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <div>
        <label
          htmlFor="signup-terms"
          className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-700"
        >
          <input
            id="signup-terms"
            type="checkbox"
            aria-invalid={!!errors.agreeTerms}
            className="mt-0.5 h-4 w-4 rounded border-sand-300 text-ink-900 focus-ring"
            {...register("agreeTerms")}
          />
          <span>
            I agree to the{" "}
            <Link
              href="/contact"
              className="focus-ring rounded font-medium text-gold-dark hover:text-ink-900"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/contact"
              className="focus-ring rounded font-medium text-gold-dark hover:text-ink-900"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.agreeTerms && (
          <p className={errorClass}>{errors.agreeTerms.message}</p>
        )}
      </div>

      <label
        htmlFor="signup-marketing"
        className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-700"
      >
        <input
          id="signup-marketing"
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-sand-300 text-ink-900 focus-ring"
          {...register("marketingOptIn")}
        />
        <span>Send me design inspiration and occasional updates.</span>
      </label>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Creating account…" : "Create Account"}
      </Button>

      <SocialAuthButtons verb="Sign up" />

      <p className="text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="focus-ring rounded font-medium text-gold-dark hover:text-ink-900"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
