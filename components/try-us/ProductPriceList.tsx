"use client";

import Image from "next/image";
import { MapPin, MapPinOff } from "lucide-react";
import type { DesignProduct } from "@/lib/types";
import { formatCurrency, humanize, cn } from "@/lib/utils";

interface ProductPriceListProps {
  products: DesignProduct[];
  onToggle: (productId: string) => void;
  compact?: boolean;
}

/** List of a design's products with include/exclude toggles and pricing. */
export function ProductPriceList({ products, onToggle, compact }: ProductPriceListProps) {
  return (
    <ul className="space-y-3">
      {products.map((p) => (
        <li
          key={p.id}
          className={cn(
            "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
            p.included ? "border-white/10 bg-void" : "border-white/10 bg-base/5 opacity-70"
          )}
        >
          {!compact && (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              <Image src={p.image} alt={p.name} fill sizes="56px" className="object-cover" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{humanize(p.category)}</span>
              <span aria-hidden>·</span>
              <span>Qty {p.quantity}</span>
              <span aria-hidden>·</span>
              <span>{formatCurrency(p.price, p.currency)} each</span>
            </div>
            <span
              className={cn(
                "mt-1 inline-flex items-center gap-1 text-[11px] font-medium",
                p.locationAvailability ? "text-emerald-600" : "text-amber-600"
              )}
            >
              {p.locationAvailability ? (
                <>
                  <MapPin className="h-3 w-3" /> Available near you
                </>
              ) : (
                <>
                  <MapPinOff className="h-3 w-3" /> Limited availability · short lead time
                </>
              )}
            </span>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(p.price * p.quantity, p.currency)}
            </span>
            {/* Include / exclude toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={p.included}
              aria-label={`${p.included ? "Exclude" : "Include"} ${p.name}`}
              onClick={() => onToggle(p.id)}
              className={cn(
                "focus-ring relative h-6 w-11 rounded-full transition-colors",
                p.included ? "bg-base/10" : "bg-sand-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-void shadow transition-transform",
                  p.included ? "translate-x-[22px]" : "translate-x-0.5"
                )}
              />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
