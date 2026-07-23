"use client";

import { motion } from "framer-motion";
import { Check, Sofa, Flower2, Lightbulb, Trees } from "lucide-react";
import type { DesignType, ItemCategory, SelectedItem } from "@/lib/types";
import {
  ITEM_CATEGORY_LABELS,
  SELECTABLE_ITEMS,
  groupItemsByCategory,
} from "@/lib/mock-data/itemCategories";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<ItemCategory, typeof Sofa> = {
  furniture: Sofa,
  decor: Flower2,
  lighting: Lightbulb,
  exterior: Trees,
};

interface ItemSelectorProps {
  designType: DesignType;
  selected: SelectedItem[];
  onChange: (items: SelectedItem[]) => void;
  error?: string;
}

export function ItemSelector({ designType, selected, onChange, error }: ItemSelectorProps) {
  const selectedIds = new Set(selected.map((s) => s.id));

  // Only show items relevant to the chosen design type (plus "both").
  const relevant = SELECTABLE_ITEMS.filter(
    (i) => i.designType === designType || i.designType === "both"
  );
  const groups = groupItemsByCategory(relevant);

  const toggle = (id: string) => {
    const item = relevant.find((i) => i.id === id);
    if (!item) return;
    if (selectedIds.has(id)) {
      onChange(selected.filter((s) => s.id !== id));
    } else {
      onChange([
        ...selected,
        { id: item.id, label: item.label, category: item.category },
      ]);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Select the items you&apos;d like included.{" "}
          <span className="text-gold-dark">*</span>
        </p>
        <span className="rounded-full bg-base/10 px-3 py-1 text-xs font-medium text-foreground">
          {selected.length} selected
        </span>
      </div>

      <div className="space-y-8">
        {(Object.keys(groups) as ItemCategory[]).map((category) => {
          const items = groups[category];
          if (items.length === 0) return null;
          const CatIcon = CATEGORY_ICON[category];
          return (
            <div key={category}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-foreground/90">
                <CatIcon className="h-4 w-4 text-gold-dark" />
                {ITEM_CATEGORY_LABELS[category]}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map((item) => {
                  const isSelected = selectedIds.has(item.id);
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggle(item.id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "focus-ring relative flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all",
                        isSelected
                          ? "border-white/20 bg-base/10 text-foreground shadow-glow"
                          : "border-white/10 bg-void text-foreground/90 hover:border-white/20"
                      )}
                    >
                      <span>{item.label}</span>
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                          isSelected
                            ? "border-gold bg-gold text-foreground"
                            : "border-white/20"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
