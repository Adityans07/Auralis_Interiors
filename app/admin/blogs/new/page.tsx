"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminBlogForm } from "@/components/admin/AdminBlogForm";
import { createAdminBlog } from "@/lib/services/adminService";

export default function AdminNewBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <AdminPageHeader title="Create Blog Post" description="Create and publish articles for public blog pages." />
      <AdminBlogForm
        isSubmitting={saving}
        onSubmit={async (payload) => {
          setSaving(true);
          try {
            await createAdminBlog(payload as never);
            router.push("/admin/blogs");
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
