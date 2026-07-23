import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address to secure your Auralis Interiors account.",
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="One quick step to secure your account."
      footer={
        <>
          Wrong account?{" "}
          <Link
            href="/login"
            className="font-medium text-gold-dark hover:text-foreground"
          >
            Log in
          </Link>
        </>
      }
    >
      <Suspense fallback={null}>
        <VerifyEmailCard />
      </Suspense>
    </AuthLayout>
  );
}
