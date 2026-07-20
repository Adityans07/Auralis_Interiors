"use client";

import { Sparkles, Lock, Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PaidGenerationModalProps {
  open: boolean;
  onClose: () => void;
  /** Triggers real checkout-session creation when backend billing is enabled. */
  onContinueToPayment: () => void;
  amountCents?: number;
  busy?: boolean;
  error?: string | null;
}

/**
 * Shown when a user who has already used their free generation tries to
 * generate again. The checkout is backend-driven through Stripe session
 * creation. If billing is not configured yet, an actionable error is shown.
 */
export function PaidGenerationModal({
  open,
  onClose,
  onContinueToPayment,
  amountCents,
  busy = false,
  error = null,
}: PaidGenerationModalProps) {
  const amount = typeof amountCents === "number" ? `$${(amountCents / 100).toFixed(2)}` : "$29.00";

  return (
    <Modal open={open} onClose={onClose} labelledBy="paywall-title">
      <div className="p-8">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-gold-light">
          <Lock className="h-6 w-6" />
        </span>
        <h2 id="paywall-title" className="mt-5 text-2xl font-semibold text-ink-900">
          You&apos;ve used your free design
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Your first AI generation was on us. To create a new set of
          personalized design concepts, continue with a paid design request.
        </p>

        <div className="mt-6 rounded-2xl border border-sand-200 bg-white/70 p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-ink-700">
              Additional design generation
            </span>
            <span className="font-serif text-2xl font-semibold text-ink-900">
              {amount}
            </span>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-ink-500">
            {[
              "3–5 fresh AI design concepts",
              "Location-matched product pricing",
              "Human designer review",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={onContinueToPayment}
            size="lg"
            variant="secondary"
            className="w-full justify-center"
            disabled={busy}
          >
            <Sparkles className="h-4 w-4" /> Continue to Payment
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full justify-center">
            Maybe later
          </Button>
        </div>
        {error ? (
          <p role="alert" className="mt-4 text-center text-xs text-red-600">
            {error}
          </p>
        ) : (
          <p className="mt-4 text-center text-xs text-ink-400">
            Your payment is processed on a secure checkout page.
          </p>
        )}
      </div>
    </Modal>
  );
}
