import { Inbox } from "lucide-react";

export function AdminEmptyState({
  title = "No records yet",
  message = "Try adjusting your filters or create a new record.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-sand-300 bg-white/70 px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100 text-ink-600">
        <Inbox className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{message}</p>
    </div>
  );
}
