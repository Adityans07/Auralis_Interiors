"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { deleteAdminBlog, getAdminBlogs, updateAdminBlog } from "@/lib/services/adminService";
import type { AdminBlogPost } from "@/lib/types/admin";

export default function AdminBlogsPage() {
  const [items, setItems] = useState<AdminBlogPost[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminBlogs({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  const togglePublished = async (row: AdminBlogPost) => {
    await updateAdminBlog(row.id, { published: !row.published });
    setItems((current) =>
      current.map((item) => (item.id === row.id ? { ...item, published: !item.published } : item))
    );
  };

  const archive = async (id: string) => {
    await deleteAdminBlog(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div>
      <AdminPageHeader
        title="Blogs"
        description="Manage blog content and publish status."
        actionLabel="Create Blog"
        actionHref="/admin/blogs/new"
      />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search title, slug, category" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No blog posts"
        columns={[
          { key: "title", header: "Title", render: (row) => row.title },
          { key: "slug", header: "Slug", render: (row) => row.slug },
          { key: "category", header: "Category", render: (row) => row.category },
          { key: "author", header: "Author", render: (row) => row.authorName },
          {
            key: "published",
            header: "Published",
            render: (row) => <AdminStatusBadge status={row.published ? "PUBLISHED" : "DRAFT"} />,
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Link href={`/admin/blogs/${row.id}/edit`} className="text-sm font-medium text-gold-dark hover:text-ink-900">
                  Edit
                </Link>
                <button className="text-sm text-ink-600 hover:text-ink-900" onClick={() => togglePublished(row)}>
                  {row.published ? "Unpublish" : "Publish"}
                </button>
                <button className="text-sm text-red-600 hover:text-red-700" onClick={() => archive(row.id)}>
                  Archive
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
