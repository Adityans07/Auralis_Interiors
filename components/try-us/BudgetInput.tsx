"use client";

import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BudgetInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

const QUICK_BUDGETS = [50000, 100000, 250000, 500000];

export function BudgetInput({ value, onChange, error }: BudgetInputProps) {
  return (
    <div>
      <label htmlFor="budget" className="mb-2 block text-sm font-medium text-foreground">
        Budget <span className="text-gold-dark">*</span>
      </label>
      <div className="relative">
        <IndianRupee className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
        <input
          id="budget"
          type="number"
          min={0}
          step={100}
          inputMode="numeric"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="Enter your budget"
          aria-invalid={!!error}
          aria-describedby={error ? "budget-error" : undefined}
          className="h-12 w-full rounded-2xl border border-white/10 bg-void pl-10 pr-4 text-sm text-foreground focus-ring"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_BUDGETS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange(b)}
            className={
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (value === b
                ? "border-white/20 bg-base/10 text-foreground"
                : "border-white/20 bg-void text-muted-foreground hover:border-white/20")
            }
          >
            {formatCurrency(b, "INR")}
          </button>
        ))}
      </div>
      {error && (
        <p id="budget-error" role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
