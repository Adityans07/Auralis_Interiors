"use client";

import { DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface BudgetInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

const QUICK_BUDGETS = [2000, 5000, 10000, 25000];

export function BudgetInput({ value, onChange, error }: BudgetInputProps) {
  return (
    <div>
      <label htmlFor="budget" className="mb-2 block text-sm font-medium text-ink-800">
        Budget <span className="text-gold-dark">*</span>
      </label>
      <div className="relative">
        <DollarSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
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
          className="h-12 w-full rounded-2xl border border-sand-200 bg-white pl-10 pr-4 text-sm text-ink-900 focus-ring"
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
                ? "border-ink-900 bg-ink-900 text-sand-50"
                : "border-sand-300 bg-white text-ink-600 hover:border-ink-900/40")
            }
          >
            {formatCurrency(b)}
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
