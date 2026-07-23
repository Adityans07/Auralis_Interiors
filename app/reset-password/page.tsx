import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your Auralis Interiors account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Enter and confirm your new password."
      footer={
        <>
          Back to{" "}
          <Link
            href="/login"
            className="font-medium text-gold-dark hover:text-foreground"
          >
            Log in
          </Link>
        </>
      }
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
