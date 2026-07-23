"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminBlogSchema, type AdminBlogSchema } from "@/lib/validation-admin";
import type { AdminBlogPost } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";
import { UploadDropzone } from "@/components/try-us/UploadDropzone";
import { uploadImage } from "@/lib/services/api";

function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function AdminBlogForm({
  initial,
  onSubmit,
  isSubmitting,
}: {
  initial?: Partial<AdminBlogPost>;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initial?.coverImageUrl || undefined);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const defaults = useMemo<AdminBlogSchema>(
    () => ({
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      coverImageUrl: initial?.coverImageUrl ?? "",
      authorName: initial?.authorName ?? "Auralis Team",
      category: initial?.category ?? "General",
      tags: (initial?.tags ?? []).join(", "),
      published: Boolean(initial?.published),
    }),
    [initial]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AdminBlogSchema>({
    resolver: zodResolver(adminBlogSchema),
    defaultValues: defaults,
  });

  const title = watch("title");

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        let finalImageUrl = values.coverImageUrl;
        if (file) {
          setUploading(true);
          setUploadError(null);
          try {
            const uploaded = await uploadImage(file);
            finalImageUrl = uploaded.data.imageUrl;
            setValue("coverImageUrl", finalImageUrl);
          } catch (err: any) {
            setUploading(false);
            setUploadError(err.message || "Failed to upload image.");
            return;
          }
        }

        await onSubmit({
          ...values,
          coverImageUrl: finalImageUrl,
          tags: (values.tags ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        });
      })}
      className="grid gap-4 rounded-2xl border border-white/10 bg-base p-5 sm:grid-cols-2"
    >
      <label className="text-sm text-foreground/90">
        Title
        <input
          {...register("title")}
          onBlur={() => {
            const currentSlug = watch("slug");
            if (!currentSlug && title) {
              setValue("slug", toSlug(title));
            }
          }}
          className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50"
        />
        {errors.title ? <span className="text-xs text-red-600">{errors.title.message}</span> : null}
      </label>

      <label className="text-sm text-foreground/90">
        Slug
        <input {...register("slug")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
        {errors.slug ? <span className="text-xs text-red-600">{errors.slug.message}</span> : null}
      </label>

      <label className="sm:col-span-2 text-sm text-foreground/90">
        Excerpt
        <textarea {...register("excerpt")} rows={3} className="mt-1 w-full rounded-xl border border-white/10 px-3 py-2 focus-ring bg-void/50" />
        {errors.excerpt ? <span className="text-xs text-red-600">{errors.excerpt.message}</span> : null}
      </label>

      <label className="sm:col-span-2 text-sm text-foreground/90">
        Content
        <textarea {...register("content")} rows={12} className="mt-1 w-full rounded-xl border border-white/10 px-3 py-2 focus-ring bg-void/50" />
        {errors.content ? <span className="text-xs text-red-600">{errors.content.message}</span> : null}
      </label>

      <div className="sm:col-span-2 space-y-2">
        <span className="text-sm text-foreground/90 block">Cover Image</span>
        <UploadDropzone
          previewUrl={previewUrl}
          fileName={file?.name}
          onChange={(data) => {
            setPreviewUrl(data.previewUrl);
            setFile(data.file);
            if (!data.previewUrl) {
              setValue("coverImageUrl", "");
            } else if (!data.file && data.previewUrl.startsWith("http")) {
              setValue("coverImageUrl", data.previewUrl);
            }
          }}
        />
        {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
        {errors.coverImageUrl ? <span className="text-xs text-red-600">Please upload a cover image.</span> : null}
        <input type="hidden" {...register("coverImageUrl")} />
      </div>

      <label className="text-sm text-foreground/90">
        Author Name
        <input {...register("authorName")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
        {errors.authorName ? <span className="text-xs text-red-600">{errors.authorName.message}</span> : null}
      </label>

      <label className="text-sm text-foreground/90">
        Category
        <input {...register("category")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
      </label>

      <label className="sm:col-span-2 text-sm text-foreground/90">
        Tags (comma separated)
        <input {...register("tags")} className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring bg-void/50" />
      </label>

      <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-foreground/90 cursor-pointer">
        <input type="checkbox" {...register("published")} className="h-4 w-4 rounded border-white/20 bg-void/50 text-gold-dark focus:ring-gold-dark/50" />
        Published
      </label>

      <div className="sm:col-span-2 flex justify-end mt-4">
        <Button type="submit" disabled={isSubmitting || uploading}>
          {isSubmitting || uploading ? "Saving..." : "Save Blog"}
        </Button>
      </div>
    </form>
  );
}
