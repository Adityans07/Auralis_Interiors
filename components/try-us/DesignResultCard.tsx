"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { GeneratedDesign } from "@/lib/types";
import { formatCurrency, humanize, cn } from "@/lib/utils";
import { BudgetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductPriceList } from "./ProductPriceList";
import { PriceBreakdown } from "./PriceBreakdown";

interface DesignResultCardProps {
  design: GeneratedDesign;
  budget?: number;
  index?: number;
  isSelected?: boolean;
  onToggleProduct: (designId: string, productId: string) => void;
  onViewDetails: (design: GeneratedDesign) => void;
  onSelect: (design: GeneratedDesign) => void;
}

/** A premium proposal card for a single AI-generated design. */
export function DesignResultCard({
  design,
  budget,
  index = 0,
  isSelected,
  onToggleProduct,
  onViewDetails,
  onSelect,
}: DesignResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const includedCount = design.products.filter((p) => p.included).length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border bg-white/80 shadow-soft transition-shadow",
        isSelected ? "border-gold ring-2 ring-gold/50" : "border-sand-200"
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={design.previewImage}
          alt={`${design.title} — ${humanize(design.style)} concept`}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-800 backdrop-blur">
          {humanize(design.style)}
        </span>
        {isSelected && (
          <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-ink-900">
            <Check className="h-3.5 w-3.5" /> Selected
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-ink-900">{design.title}</h3>
        </div>
        <div className="mt-2">
          <BudgetBadge status={design.budgetStatus} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-500">
          {design.description}
        </p>

        {/* Live total */}
        <div className="mt-5 flex items-end justify-between rounded-2xl bg-sand-100/70 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-400">
              Estimated total
            </p>
            <p className="font-serif text-2xl font-semibold text-ink-900">
              {formatCurrency(
                design.products
                  .filter((p) => p.included)
                  .reduce((s, p) => s + p.price * p.quantity, 0),
                design.currency
              )}
            </p>
          </div>
          <p className="text-xs text-ink-500">
            {includedCount}/{design.products.length} products
          </p>
        </div>

        {/* Expandable product toggles */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="focus-ring mt-4 flex items-center justify-between rounded-xl px-1 py-2 text-sm font-medium text-ink-700"
        >
          Customize products
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")}
          />
        </button>

        <motion.div
          initial={false}
          animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 pt-2">
            <ProductPriceList
              products={design.products}
              onToggle={(pid) => onToggleProduct(design.id, pid)}
              compact
            />
            <PriceBreakdown
              products={design.products}
              currency={design.currency}
              budget={budget}
            />
          </div>
        </motion.div>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 justify-center"
            onClick={() => onViewDetails(design)}
          >
            <Eye className="h-4 w-4" /> View Details
          </Button>
          <Button
            variant={isSelected ? "secondary" : "primary"}
            className="flex-1 justify-center"
            onClick={() => onSelect(design)}
          >
            {isSelected ? "Selected" : "Select This Design"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
