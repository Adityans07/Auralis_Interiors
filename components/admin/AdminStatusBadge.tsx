import { cn, humanize } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REQUESTED: "bg-amber-50 text-amber-700 border-amber-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  SUSPENDED: "bg-red-50 text-red-700 border-red-200",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  GENERATING: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export function AdminStatusBadge({ status }: { status: string }) {
  const normalized = status?.toUpperCase?.() ?? "UNKNOWN";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        STATUS_COLORS[normalized] ?? "bg-slate-100 text-slate-700 border-slate-200"
      )}
    >
      {humanize((status || "UNKNOWN").toLowerCase())}
    </span>
  );
}
