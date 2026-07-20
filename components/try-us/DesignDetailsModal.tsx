"use client";

import Image from "next/image";
import { Lightbulb, ArrowRight } from "lucide-react";
import type { GeneratedDesign } from "@/lib/types";
import { humanize } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { BudgetBadge } from "@/components/ui/Badge";
import { ProductPriceList } from "./ProductPriceList";
import { PriceBreakdown } from "./PriceBreakdown";

interface DesignDetailsModalProps {
  design: GeneratedDesign | null;
  budget?: number;
  open: boolean;
  onClose: () => void;
  onToggleProduct: (designId: string, productId: string) => void;
  onSelect: (design: GeneratedDesign) => void;
}

/** Expanded "View Details" view: large preview, concept, products, breakdown. */
export function DesignDetailsModal({
  design,
  budget,
  open,
  onClose,
  onToggleProduct,
  onSelect,
}: DesignDetailsModalProps) {
  return (
    <Modal open={open && !!design} onClose={onClose} className="max-w-2xl" labelledBy="design-details-title">
      {design && (
        <div>
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={design.previewImage}
              alt={`${design.title} concept`}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
            />
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-700">
                {humanize(design.style)}
              </span>
              <BudgetBadge status={design.budgetStatus} />
            </div>

            <h2 id="design-details-title" className="mt-3 text-2xl font-semibold text-ink-900">
              {design.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {design.description}
            </p>

            <div className="mt-6 rounded-2xl border border-sand-200 bg-sand-100/50 p-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <Lightbulb className="h-4 w-4 text-gold-dark" /> Design concept
              </h3>
              <ul className="mt-3 space-y-2">
                {design.designNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-sm text-ink-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <h3 className="mt-6 text-sm font-semibold text-ink-800">
              Products & pricing
            </h3>
            <div className="mt-3 space-y-4">
              <ProductPriceList
                products={design.products}
                onToggle={(pid) => onToggleProduct(design.id, pid)}
              />
              <PriceBreakdown
                products={design.products}
                currency={design.currency}
                budget={budget}
              />
            </div>

            <div className="mt-6 rounded-2xl bg-ink-950 p-4 text-sand-100/80">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                Recommended next steps
              </p>
              <p className="mt-1 text-sm">
                Fine-tune your product list, then select this design. Our team
                will reach out to confirm availability and finalize your quote.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="flex-1 justify-center" onClick={onClose}>
                Keep browsing
              </Button>
              <Button
                variant="primary"
                className="flex-1 justify-center"
                onClick={() => onSelect(design)}
              >
                Select This Design <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
