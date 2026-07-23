"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Lock, Sparkles, Zap } from "lucide-react";

interface FreeTrialBannerProps {
  isAuthenticated: boolean;
  /** Whether the free generation has been used for the current actor. */
  hasUsedFree: boolean;
  /** Number of admin-granted bonus generations remaining. */
  bonusFreeGenerations?: number;
  loading?: boolean;
}

/**
 * Communicates the free/paid generation state, tailored to auth status.
 */
export function FreeTrialBanner({
  isAuthenticated,
  hasUsedFree,
  bonusFreeGenerations = 0,
  loading = false,
}: FreeTrialBannerProps) {
  if (loading) {
    return (
      <Banner tone="emerald" icon={<Sparkles className="h-5 w-5 shrink-0" />}>
        Checking your free generation eligibility…
      </Banner>
    );
  }

  // Both original free gen available AND bonus granted (rare admin edge case)
  if (!hasUsedFree && bonusFreeGenerations > 0) {
    const remaining = bonusFreeGenerations + 1; // +1 for original unused free gen
    return (
      <Banner tone="blue" icon={<Zap className="h-5 w-5 shrink-0" />}>
        You have{" "}
        <strong>{remaining} generation{remaining !== 1 ? "s" : ""}</strong> remaining — enjoy your complimentary credits.
      </Banner>
    );
  }

  // User's original free gen was used but has bonus remaining
  if (hasUsedFree && bonusFreeGenerations > 0) {
    return (
      <Banner tone="blue" icon={<Zap className="h-5 w-5 shrink-0" />}>
        You have{" "}
        <strong>{bonusFreeGenerations} bonus generation{bonusFreeGenerations !== 1 ? "s" : ""}</strong>{" "}
        remaining — enjoy your complimentary credits.
      </Banner>
    );
  }

  // All generations exhausted → paywall.
  if (hasUsedFree) {
    return (
      <Banner tone="amber" icon={<Lock className="h-5 w-5 shrink-0" />}>
        You have used your free design generation. Continue with a paid design
        request to create new concepts.
      </Banner>
    );
  }

  // Logged in with original free generation still available.
  if (isAuthenticated) {
    return (
      <Banner tone="emerald" icon={<Sparkles className="h-5 w-5 shrink-0" />}>
        Your first AI design generation is available — it&apos;s on us.
      </Banner>
    );
  }

  // Guest.
  return (
    <Banner tone="emerald" icon={<Gift className="h-5 w-5 shrink-0" />}>
      Your first AI design generation is free.{" "}
      <Link href="/signup" className="font-semibold underline underline-offset-2">
        Create an account
      </Link>{" "}
      to save your results.
    </Banner>
  );
}

function Banner({
  tone,
  icon,
  children,
}: {
  tone: "amber" | "emerald" | "blue";
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const cls =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : tone === "blue"
      ? "border-blue-200 bg-blue-50 text-blue-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="status"
      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${cls}`}
    >
      {icon}
      <p className="text-sm font-medium">{children}</p>
    </motion.div>
  );
}
