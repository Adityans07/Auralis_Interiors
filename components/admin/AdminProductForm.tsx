"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminProductSchema, type AdminProductSchema } from "@/lib/validation-admin";
import type { AdminProduct } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminProductForm({
  initial,
  onSubmit,
  isSubmitting,
}: {
  initial?: Partial<AdminProduct>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const defaults = useMemo<AdminProductSchema>(
    () => ({
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      category: initial?.category ?? "",
      subcategory: initial?.subcategory ?? "",
      description: initial?.description ?? "",
      price: initial?.price ?? 1,
      currency: initial?.currency ?? "USD",
      imageUrl: initial?.imageUrl ?? "",
      brand: initial?.brand ?? "",
      material: initial?.material ?? "",
      color: initial?.color ?? "",
      styleTags: (initial?.styleTags ?? []).join(", "),
      itemType: initial?.itemType ?? "",
      roomTypes: (initial?.roomTypes ?? []).join(", "),
      designTypes: (initial?.designTypes ?? []).join(", "),
      city: initial?.city ?? "",
      state: initial?.state ?? "",
      country: initial?.country ?? "",
      postalCode: initial?.postalCode ?? "",
      stockStatus: initial?.stockStatus ?? "IN_STOCK",
      vendorName: initial?.vendorName ?? "",
      vendorUrl: initial?.vendorUrl ?? "",
    }),
    [initial]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminProductSchema>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: defaults,
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          ...values,
          styleTags: splitCsv(values.styleTags ?? ""),
          roomTypes: splitCsv(values.roomTypes),
          designTypes: splitCsv(values.designTypes),
          subcategory: values.subcategory || null,
          state: values.state || null,
          postalCode: values.postalCode || null,
          brand: values.brand || null,
          material: values.material || null,
          color: values.color || null,
          vendorName: values.vendorName || null,
          vendorUrl: values.vendorUrl || null,
          currency: values.currency.toUpperCase(),
        });
      })}
      className="grid gap-4 rounded-2xl border border-sand-200 bg-white p-5 sm:grid-cols-2"
    >
      {[
        ["name", "Name"],
        ["slug", "Slug"],
        ["category", "Category"],
        ["itemType", "Item Type"],
        ["price", "Price"],
        ["currency", "Currency"],
        ["city", "City"],
        ["state", "State"],
        ["country", "Country"],
        ["postalCode", "Postal Code"],
        ["brand", "Brand"],
        ["vendorName", "Vendor"],
      ].map(([key, label]) => (
        <label key={key} className="text-sm text-ink-700">
          {label}
          <input
            {...register(key as keyof AdminProductSchema)}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring"
          />
          {errors[key as keyof AdminProductSchema] ? (
            <span className="text-xs text-red-600">
              {String(errors[key as keyof AdminProductSchema]?.message ?? "")}
            </span>
          ) : null}
        </label>
      ))}

      <label className="sm:col-span-2 text-sm text-ink-700">
        Description
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2 focus-ring"
        />
        {errors.description ? <span className="text-xs text-red-600">{errors.description.message}</span> : null}
      </label>

      <label className="sm:col-span-2 text-sm text-ink-700">
        Image URL
        <input {...register("imageUrl")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
        {errors.imageUrl ? <span className="text-xs text-red-600">{errors.imageUrl.message}</span> : null}
      </label>

      <label className="sm:col-span-2 text-sm text-ink-700">
        Style Tags (comma separated)
        <input {...register("styleTags")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
      </label>

      <label className="sm:col-span-2 text-sm text-ink-700">
        Room Types (comma separated)
        <input {...register("roomTypes")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
      </label>

      <label className="sm:col-span-2 text-sm text-ink-700">
        Design Types (comma separated)
        <input {...register("designTypes")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
      </label>

      <label className="text-sm text-ink-700">
        Stock Status
        <select {...register("stockStatus")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring">
          <option value="IN_STOCK">In Stock</option>
          <option value="LIMITED">Limited</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </label>

      <label className="text-sm text-ink-700">
        Vendor URL
        <input {...register("vendorUrl")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
      </label>

      <div className="sm:col-span-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
