"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CalendarCheck, MessageSquare, Loader2, BadgeCheck, UserPlus } from "lucide-react";
import type { GeneratedDesign } from "@/lib/types";
import { formatCurrency, humanize } from "@/lib/utils";
import { designContactSchema, type DesignContactSchema } from "@/lib/validation";
import { submitSelectedDesign } from "@/lib/services/api";
import { setRedirectIntent } from "@/lib/services/redirect";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface DesignSelectionModalProps {
  design: GeneratedDesign | null;
  open: boolean;
  onClose: () => void;
  /** When logged in, contact fields are prefilled from the profile. */
  isAuthenticated?: boolean;
  prefill?: { name: string; email: string; phone: string };
}

const fieldClass =
  "h-11 w-full rounded-2xl border border-white/10 bg-void px-4 text-sm text-foreground focus-ring";

/**
 * Captures contact details for the chosen design and confirms the selection.
 * Calls submitSelectedDesign() (mock) → POST /api/designs/select later.
 */
export function DesignSelectionModal({
  design,
  open,
  onClose,
  isAuthenticated = false,
  prefill,
}: DesignSelectionModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DesignContactSchema>({
    resolver: zodResolver(designContactSchema),
    defaultValues: {
      name: prefill?.name ?? "",
      email: prefill?.email ?? "",
      phone: prefill?.phone ?? "",
    },
  });

  if (!design) return null;

  const included = design.products.filter((p) => p.included);
  const total = included.reduce((s, p) => s + p.price * p.quantity, 0);

  const onSubmit = async (data: DesignContactSchema) => {
    await submitSelectedDesign({
      designId: design.id,
      includedProductIds: included.map((p) => p.id),
      adjustedTotal: total,
      currency: design.currency,
      contact: data,
    });
    setSubmitted(true);
  };

  const close = () => {
    onClose();
    // Reset after the close animation so content doesn't flash.
    setTimeout(() => {
      setSubmitted(false);
      reset();
    }, 250);
  };

  return (
    <Modal open={open} onClose={close} labelledBy="selection-title">
      <div className="p-6 sm:p-8">
        {/* Selected design summary */}
        <div className="rounded-2xl border border-white/10 bg-base/5 p-4">
          <p className="text-xs uppercase tracking-widest text-gold-dark">
            Selected design
          </p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <div>
              <p className="font-serif text-lg font-semibold text-foreground">
                {design.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {humanize(design.style)} · {included.length} products
              </p>
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">
              {formatCurrency(total, design.currency)}
            </span>
          </div>
        </div>

        {submitted ? (
          <div className="mt-6 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <h2 id="selection-title" className="mt-4 text-2xl font-semibold text-foreground">
              Great choice!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Our team will contact you to finalize the deal. In the meantime,
              you can book a consultation or reach out with any questions.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                href={`/booking?design=${encodeURIComponent(design.title)}`}
                variant="primary"
                className="flex-1 justify-center"
              >
                <CalendarCheck className="h-4 w-4" /> Book Final Consultation
              </Button>
              <Button href="/contact" variant="outline" className="flex-1 justify-center">
                <MessageSquare className="h-4 w-4" /> Contact Team
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <h2 id="selection-title" className="text-xl font-semibold text-foreground">
              Where should we reach you?
            </h2>
            <p className="-mt-2 text-sm text-muted-foreground">
              Share your details and our design team will follow up to finalize
              everything.
            </p>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <BadgeCheck className="h-4 w-4 shrink-0" />
                This design will be saved to your account.
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-base/5 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <UserPlus className="h-4 w-4 text-gold-dark" /> Save this design
                  to your account
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Continue as a guest below, or{" "}
                  <Link
                    href="/signup"
                    onClick={() => setRedirectIntent("/try-us")}
                    className="font-medium text-gold-dark underline underline-offset-2"
                  >
                    create an account
                  </Link>{" "}
                  /{" "}
                  <Link
                    href="/login"
                    onClick={() => setRedirectIntent("/try-us")}
                    className="font-medium text-gold-dark underline underline-offset-2"
                  >
                    log in
                  </Link>{" "}
                  to save it.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="sel-name" className="mb-1.5 block text-sm font-medium text-foreground">
                Full name *
              </label>
              <input id="sel-name" className={fieldClass} aria-invalid={!!errors.name} {...register("name")} />
              {errors.name && <p role="alert" className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="sel-email" className="mb-1.5 block text-sm font-medium text-foreground">
                  Email *
                </label>
                <input id="sel-email" type="email" className={fieldClass} aria-invalid={!!errors.email} {...register("email")} />
                {errors.email && <p role="alert" className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div>
                <label htmlFor="sel-phone" className="mb-1.5 block text-sm font-medium text-foreground">
                  Phone *
                </label>
                <input id="sel-phone" type="tel" className={fieldClass} aria-invalid={!!errors.phone} {...register("phone")} />
                {errors.phone && <p role="alert" className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="sel-time" className="mb-1.5 block text-sm font-medium text-foreground">
                Preferred contact time
              </label>
              <input
                id="sel-time"
                className={fieldClass}
                placeholder="e.g. Weekday mornings"
                {...register("preferredContactTime")}
              />
            </div>

            <Button type="submit" size="lg" variant="secondary" disabled={isSubmitting} className="w-full justify-center">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Confirming…
                </>
              ) : (
                "Confirm Selection"
              )}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
