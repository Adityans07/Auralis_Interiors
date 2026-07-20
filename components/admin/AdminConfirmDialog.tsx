"use client";

import { Button } from "@/components/ui/Button";

export function AdminConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      <div className="mt-4 flex gap-2">
        <Button type="button" size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
