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
    <div className="rounded-3xl border border-white/10 bg-base/5 p-6 shadow-glow">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
        {icon}
      </span>
      <p className="mt-4 font-serif text-3xl font-semibold text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-muted-foreground">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );
}
