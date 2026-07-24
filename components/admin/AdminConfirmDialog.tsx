"use client";

import { Button } from "@/components/ui/Button";

export function AdminConfirmDialog({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive,
}: {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  destructive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-base p-5 shadow-glow">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-4 flex gap-2">
        <Button type="button" size="sm" onClick={onConfirm} className={destructive ? "bg-red-500 hover:bg-red-600 text-white hover:shadow-red-500/20" : ""}>
          {confirmLabel}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
}
