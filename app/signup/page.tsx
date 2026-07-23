import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/forms/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Auralis Interiors account to save designs, track budgets, and manage consultations in one place.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save your designs, track budgets, and manage consultations in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-gold-dark hover:text-foreground"
          >
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
