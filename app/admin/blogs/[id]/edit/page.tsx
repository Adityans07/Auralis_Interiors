"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminBlogForm } from "@/components/admin/AdminBlogForm";
import { getAdminBlogById, updateAdminBlog } from "@/lib/services/adminService";
import type { AdminBlogPost } from "@/lib/types/admin";

export default function AdminEditBlogPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [blog, setBlog] = useState<AdminBlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    getAdminBlogById(params.id).then((response) => setBlog(response.data));
  }, [params?.id]);

  if (!blog) {
    return <p className="text-sm text-ink-500">Loading blog...</p>;
  }

  return (
    <div>
      <AdminPageHeader title={`Edit Blog ${blog.title}`} description="Update article content and publication status." />
      <AdminBlogForm
        initial={blog}
        isSubmitting={saving}
        onSubmit={async (payload) => {
          setSaving(true);
          try {
            await updateAdminBlog(blog.id, payload as never);
            router.push("/admin/blogs");
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
