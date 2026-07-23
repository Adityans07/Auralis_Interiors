"use client";

import { FileText, Receipt } from "lucide-react";
import type { CustomerPayment, PaymentStatus } from "@/lib/types";
import { useToast } from "@/components/ui/Toast";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  free: {
    label: "Free",
    className: "bg-gold/15 text-gold-dark border-gold/30",
  },
};

interface PaymentHistoryCardProps {
  payment: CustomerPayment;
}

export function PaymentHistoryCard({ payment }: PaymentHistoryCardProps) {
  const { toast } = useToast();
  const status = STATUS_CONFIG[payment.status];
  const isFree = payment.amount === 0 || payment.status === "free";

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-base/5 p-5 shadow-glow sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-muted-foreground">
          <Receipt className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {payment.description}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground/80">
            {payment.id} · {formatDate(payment.date)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
            status.className
          )}
        >
          {status.label}
        </span>
        <span className="w-20 text-right font-serif text-lg font-semibold text-foreground tabular-nums">
          {isFree ? "Free" : formatCurrency(payment.amount, payment.currency)}
        </span>
        <button
          type="button"
          onClick={() =>
            toast("Invoices are not available in this demo.", "info")
          }
          className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-base px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <FileText className="h-3.5 w-3.5" aria-hidden />
          Invoice
        </button>
      </div>
    </div>
  );
}
