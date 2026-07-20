"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminBlogSchema, type AdminBlogSchema } from "@/lib/validation-admin";
import type { AdminBlogPost } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

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
        await onSubmit({
          ...values,
          tags: (values.tags ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
        });
      })}
      className="grid gap-4 rounded-2xl border border-sand-200 bg-white p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-ink-700">
          Title
          <input
            {...register("title")}
            onBlur={() => {
              const currentSlug = watch("slug");
              if (!currentSlug && title) {
                setValue("slug", toSlug(title));
              }
            }}
            className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring"
          />
          {errors.title ? <span className="text-xs text-red-600">{errors.title.message}</span> : null}
        </label>
        <label className="text-sm text-ink-700">
          Slug
          <input {...register("slug")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
          {errors.slug ? <span className="text-xs text-red-600">{errors.slug.message}</span> : null}
        </label>
      </div>

      <label className="text-sm text-ink-700">
        Excerpt
        <textarea {...register("excerpt")} rows={3} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2 focus-ring" />
        {errors.excerpt ? <span className="text-xs text-red-600">{errors.excerpt.message}</span> : null}
      </label>

      <label className="text-sm text-ink-700">
        Content
        <textarea {...register("content")} rows={10} className="mt-1 w-full rounded-xl border border-sand-200 px-3 py-2 focus-ring" />
        {errors.content ? <span className="text-xs text-red-600">{errors.content.message}</span> : null}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-ink-700">
          Cover Image URL
          <input {...register("coverImageUrl")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
          {errors.coverImageUrl ? <span className="text-xs text-red-600">{errors.coverImageUrl.message}</span> : null}
        </label>
        <label className="text-sm text-ink-700">
          Author Name
          <input {...register("authorName")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
          {errors.authorName ? <span className="text-xs text-red-600">{errors.authorName.message}</span> : null}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm text-ink-700">
          Category
          <input {...register("category")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
        </label>
        <label className="sm:col-span-2 text-sm text-ink-700">
          Tags (comma separated)
          <input {...register("tags")} className="mt-1 h-10 w-full rounded-xl border border-sand-200 px-3 focus-ring" />
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" {...register("published")} className="h-4 w-4 rounded border-sand-300" />
        Published
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Blog"}
        </Button>
      </div>
    </form>
  );
}
