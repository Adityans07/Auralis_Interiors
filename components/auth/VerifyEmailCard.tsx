"use client";

import { useRef, useState } from "react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

export function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { customer, resendVerificationEmail, confirmEmailVerified } = useAuth();
  const { toast } = useToast();

  const [resending, setResending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const autoHandledToken = useRef<string | null>(null);

  const email = customer?.email;
  const token = searchParams.get("token") ?? undefined;

  useEffect(() => {
    if (!token) return;
    if (autoHandledToken.current === token) return;
    autoHandledToken.current = token;

    let active = true;
    setConfirming(true);
    confirmEmailVerified(token)
      .then(() => {
        if (!active) return;
        toast("Email verified successfully.", "success");
        router.replace("/account");
      })
      .catch((err) => {
        if (!active) return;
        toast(
          err instanceof Error
            ? err.message
            : "We couldn't verify this link. Please request a new one.",
          "error"
        );
      })
      .finally(() => {
        if (active) setConfirming(false);
      });

    return () => {
      active = false;
    };
  }, [token, confirmEmailVerified, router, toast]);

  if (customer?.emailVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-soft"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </span>
        <h3 className="mt-5 font-serif text-2xl font-semibold text-ink-900">
          Email verified
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Your email address has been confirmed. You&apos;re all set.
        </p>
        <Button href="/account" className="mt-6">
          Go to dashboard
        </Button>
      </motion.div>
    );
  }

  const onResend = async () => {
    setResending(true);
    try {
      const message = await resendVerificationEmail();
      toast(message || "Verification email sent.", "success");
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "We couldn't resend the email. Please try again.",
        "error"
      );
    } finally {
      setTimeout(() => setResending(false), 1500);
    }
  };

  const onConfirm = async () => {
    setConfirming(true);
    try {
      await confirmEmailVerified(token);
      router.push("/account");
    } catch (err) {
      toast(
        err instanceof Error
          ? err.message
          : "We couldn't confirm verification. Please try again.",
        "error"
      );
      setConfirming(false);
    }
  };

  return (
    <div className="rounded-3xl border border-sand-200 bg-white/80 p-8 text-center shadow-soft">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink-900/5 text-gold-dark">
        <Mail className="h-7 w-7" aria-hidden />
      </span>
      <h3 className="mt-5 font-serif text-2xl font-semibold text-ink-900">
        Confirm your email
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-600">
        We&apos;ve sent a verification link to{" "}
        {email ? (
          <span className="font-medium text-ink-900">{email}</span>
        ) : (
          "your inbox"
        )}
        .
      </p>
      <p className="mt-1 text-xs text-ink-500">
        Click the link in the email, then confirm below.
      </p>

      <div className="mt-6 grid gap-3">
        <Button
          type="button"
          size="lg"
          disabled={confirming}
          className="w-full"
          onClick={onConfirm}
        >
          {confirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming…
            </>
          ) : (
            "I Have Verified My Email"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={resending}
          className="w-full"
          onClick={onResend}
        >
          {resending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Resend Verification Email"
          )}
        </Button>
      </div>
    </div>
  );
}
