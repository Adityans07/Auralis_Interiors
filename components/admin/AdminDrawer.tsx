"use client";

import { cn } from "@/lib/utils";

export function AdminDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("fixed inset-0 z-[80] transition", open ? "pointer-events-auto" : "pointer-events-none")}>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={cn("absolute inset-0 bg-base/10/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-base p-5 shadow-glow transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-base/10">
            Close
          </button>
        </div>
        <div className="h-[calc(100%-2rem)] overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
