"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminProductSchema, type AdminProductSchema } from "@/lib/validation-admin";
import type { AdminProduct } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";
import { UploadDropzone } from "@/components/try-us/UploadDropzone";
import { uploadImage } from "@/lib/services/api";

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
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initial?.imageUrl || undefined);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    setValue,
    formState: { errors },
  } = useForm<AdminProductSchema>({
    resolver: zodResolver(adminProductSchema),
    defaultValues: defaults,
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        let finalImageUrl = values.imageUrl;
        if (file) {
          setUploading(true);
          setUploadError(null);
          try {
            const uploaded = await uploadImage(file);
            finalImageUrl = uploaded.data.imageUrl;
            setValue("imageUrl", finalImageUrl); // Update the form value just in case
          } catch (err: any) {
            setUploading(false);
            setUploadError(err.message || "Failed to upload image.");
            return;
          }
        }
        
        await onSubmit({
          ...values,
          imageUrl: finalImageUrl,
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
      className="grid gap-4 rounded-2xl border border-white/10 bg-base p-5 sm:grid-cols-2"
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
        <label key={key} className="text-sm text-foreground/90">
          {label}
          <input
            {...register(key as keyof AdminProductSchema)}
            className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50"
          />
          {errors[key as keyof AdminProductSchema] ? (
            <span className="text-xs text-red-600">
              {String(errors[key as keyof AdminProductSchema]?.message ?? "")}
            </span>
          ) : null}
        </label>
      ))}

      <label className="sm:col-span-2 text-sm text-foreground/90">
        Description
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 w-full rounded-xl border border-white/10 px-3 py-2 focus-ring bg-void/50"
        />
        {errors.description ? <span className="text-xs text-red-600">{errors.description.message}</span> : null}
      </label>

      <div className="sm:col-span-2 space-y-2">
        <span className="text-sm text-foreground/90 block">Product Image</span>
        <UploadDropzone
          previewUrl={previewUrl}
          fileName={file?.name}
          onChange={(data) => {
            setPreviewUrl(data.previewUrl);
            setFile(data.file);
            if (!data.previewUrl) {
              // If removed, we should probably clear the image URL so validation fails if it's required
              setValue("imageUrl", "");
            } else if (!data.file && data.previewUrl.startsWith("http")) {
              setValue("imageUrl", data.previewUrl);
            }
          }}
        />
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        {errors.imageUrl ? <span className="text-xs text-red-600">Please upload an image.</span> : null}
        {/* Hidden input just to track the url in react-hook-form if it was already there */}
        <input type="hidden" {...register("imageUrl")} />
      </div>

      <label className="sm:col-span-2 text-sm text-foreground/90">
        Style Tags (comma separated)
        <input {...register("styleTags")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
      </label>

      <label className="sm:col-span-2 text-sm text-foreground/90">
        Room Types (comma separated)
        <input {...register("roomTypes")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
      </label>

      <label className="sm:col-span-2 text-sm text-foreground/90">
        Design Types (comma separated)
        <input {...register("designTypes")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
      </label>

      <label className="text-sm text-foreground/90">
        Stock Status
        <select {...register("stockStatus")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50">
          <option value="IN_STOCK">In Stock</option>
          <option value="LIMITED">Limited</option>
          <option value="OUT_OF_STOCK">Out of Stock</option>
        </select>
      </label>

      <label className="text-sm text-foreground/90">
        Vendor URL
        <input {...register("vendorUrl")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
      </label>

      <div className="sm:col-span-2 flex justify-end mt-4">
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting || uploading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}
