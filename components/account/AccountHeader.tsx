"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";

interface AccountHeaderProps {
  /** Optional page title — falls back to a personalized greeting. */
  title?: string;
  description?: string;
}

export function AccountHeader({ title, description }: AccountHeaderProps) {
  const { customer } = useAuth();
  const firstName = customer?.name?.trim().split(/\s+/)[0] || "there";

  const heading = title ?? `Welcome back, ${firstName}`;
  const subtitle =
    description ??
    "Manage your AI design concepts, bookings, and account — all in one place.";

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-soft sm:p-8 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <span className="eyebrow mb-3 flex items-center gap-2 text-gold-dark">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Your account
        </span>
        <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">
          {heading}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-500">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href="/try-us">
          Start New Design <Sparkles className="h-4 w-4" aria-hidden />
        </Button>
        <Button href="/booking" variant="outline">
          Book Consultation <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
