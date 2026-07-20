import type { ReactNode } from "react";

interface AccountStatCardProps {
  label: string;
  value: ReactNode;
  /** Pass a rendered element, e.g. icon={<LayoutGrid className="h-5 w-5" />}. */
  icon: ReactNode;
  hint?: string;
}

export function AccountStatCard({
  label,
  value,
  icon,
  hint,
}: AccountStatCardProps) {
  return (
    <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-soft">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-900 text-gold-light">
        {icon}
      </span>
      <p className="mt-4 font-serif text-3xl font-semibold text-ink-900">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-ink-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}
