"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageOff } from "lucide-react";
import type { CustomerDesignRequest, DesignRequestStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn, formatCurrency, humanize } from "@/lib/utils";

const STATUS_CONFIG: Record<
  DesignRequestStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-sand-100 text-ink-600 border-sand-200",
  },
  generating: {
    label: "Generating",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  "payment-required": {
    label: "Payment required",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  selected: {
    label: "Selected",
    className: "bg-gold/15 text-gold-dark border-gold/30",
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

interface DesignHistoryCardProps {
  request: CustomerDesignRequest;
}

export function DesignHistoryCard({ request }: DesignHistoryCardProps) {
  const status = STATUS_CONFIG[request.status];

  const selectedDesign = request.selectedDesignId
    ? request.generatedDesigns.find((d) => d.id === request.selectedDesignId)
    : undefined;
  const primaryDesign = selectedDesign ?? request.generatedDesigns[0];
  const previewImage = primaryDesign?.previewImage;
  const currency = primaryDesign?.currency ?? request.currency;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white/80 shadow-soft">
      <div className="relative aspect-[16/10] overflow-hidden bg-sand-100">
        {previewImage ? (
          <Image
            src={previewImage}
            alt={`Preview of ${primaryDesign?.title ?? humanize(request.spaceType)} design concept`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-300">
            <ImageOff className="h-8 w-8" aria-hidden />
            <span className="sr-only">No preview available yet</span>
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
            status.className
          )}
        >
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-400">
          {request.id}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold text-ink-900">
          {primaryDesign?.title ?? `${humanize(request.spaceType)} concept`}
        </h3>
        <p className="mt-1 text-sm text-ink-500">
          {humanize(request.spaceType)} · {humanize(request.style)}
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          {primaryDesign ? (
            <>
              <span className="font-serif text-xl font-semibold text-ink-900">
                {formatCurrency(primaryDesign.estimatedTotal, currency)}
              </span>
              <span className="text-xs text-ink-400">estimated total</span>
            </>
          ) : (
            <span className="text-sm text-ink-400">No concepts generated yet</span>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 pt-1">
          <Button href={`/account/designs/${request.id}`} size="sm">
            View details <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Link
            href={`/booking?design=${encodeURIComponent(request.id)}`}
            className="focus-ring rounded-full text-sm font-medium text-ink-600 underline-offset-4 hover:text-ink-900 hover:underline"
          >
            Book consultation
          </Link>
        </div>
      </div>
    </article>
  );
}
