import { cn } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/types";
import { CheckCircle2, TrendingUp, Gem } from "lucide-react";

const config: Record<
  BudgetStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  "within-budget": {
    label: "Within budget",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  "slightly-above": {
    label: "Slightly above budget",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: TrendingUp,
  },
  "premium-option": {
    label: "Premium option",
    className: "bg-violet-50 text-violet-700 border-violet-200",
    icon: Gem,
  },
};

export function BudgetBadge({ status }: { status: BudgetStatus }) {
  const { label, className, icon: Icon } = config[status] || config["premium-option"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
