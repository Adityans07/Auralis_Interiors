"use client";

import type { DesignProduct } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface PriceBreakdownProps {
  products: DesignProduct[];
  currency: string;
  budget?: number;
}

/** Computes and displays a live subtotal/total from included products. */
export function PriceBreakdown({ products, currency, budget }: PriceBreakdownProps) {
  const included = products.filter((p) => p.included);
  const subtotal = included.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const overBudget = budget && budget > 0 ? subtotal > budget : false;

  return (
    <div className="rounded-2xl border border-sand-200 bg-white/70 p-4">
      <div className="space-y-2 text-sm">
        {included.length === 0 ? (
          <p className="text-ink-400">No products included yet.</p>
        ) : (
          included.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-ink-500">
              <span className="truncate pr-3">
                {p.name}
                {p.quantity > 1 ? ` × ${p.quantity}` : ""}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatCurrency(p.price * p.quantity, currency)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-sand-200 pt-3">
        <span className="text-sm font-medium text-ink-700">
          Total ({included.length} item{included.length === 1 ? "" : "s"})
        </span>
        <span className="font-serif text-xl font-semibold text-ink-900 tabular-nums">
          {formatCurrency(subtotal, currency)}
        </span>
      </div>

      {budget && budget > 0 && (
        <p
          className={
            "mt-2 text-xs " + (overBudget ? "text-amber-600" : "text-emerald-600")
          }
        >
          {overBudget
            ? `${formatCurrency(subtotal - budget, currency)} over your ${formatCurrency(budget, currency)} budget.`
            : `${formatCurrency(budget - subtotal, currency)} under your ${formatCurrency(budget, currency)} budget.`}
        </p>
      )}
    </div>
  );
}
