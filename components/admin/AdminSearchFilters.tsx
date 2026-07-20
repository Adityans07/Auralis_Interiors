"use client";

import { Search } from "lucide-react";

export function AdminSearchFilters({
  search,
  onSearchChange,
  placeholder = "Search",
  children,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-sand-200 bg-white p-4 sm:flex-row sm:items-center">
      <label className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-sand-200 bg-white pl-9 pr-3 text-sm text-ink-900 focus-ring"
        />
      </label>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
