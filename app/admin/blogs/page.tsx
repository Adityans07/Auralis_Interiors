"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { deleteAdminBlog, archiveAdminBlog, unarchiveAdminBlog, getAdminBlogs, updateAdminBlog } from "@/lib/services/adminService";
import type { AdminBlogPost } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

export default function AdminBlogsPage() {
  const [items, setItems] = useState<AdminBlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    getAdminBlogs({ page: 1, pageSize: 50, search, includeArchived: showArchived }).then((response) => {
      setItems(response.data.items);
    });
  }, [search, showArchived]);

  const togglePublished = async (row: AdminBlogPost) => {
    await updateAdminBlog(row.id, { published: !row.published });
    setItems((current) =>
      current.map((item) => (item.id === row.id ? { ...item, published: !item.published } : item))
    );
  };

  const toggleArchiveBlog = async (row: AdminBlogPost) => {
    if (row.archivedAt) {
      await unarchiveAdminBlog(row.id);
      setItems((current) => current.filter((item) => showArchived || item.id !== row.id).map(item => item.id === row.id ? { ...item, archivedAt: null } : item));
    } else {
      await archiveAdminBlog(row.id);
      setItems((current) => current.filter((item) => showArchived || item.id !== row.id).map(item => item.id === row.id ? { ...item, archivedAt: new Date().toISOString() } : item));
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this blog post?")) return;
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
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search title, slug, category" />
        <label className="flex items-center gap-2 text-sm text-foreground/90 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showArchived} 
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-void/50 text-gold-dark focus:ring-gold-dark/50"
          />
          Show Archived
        </label>
      </div>

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
            header: "Status",
            render: (row) => <AdminStatusBadge status={row.archivedAt ? "ARCHIVED" : row.published ? "PUBLISHED" : "DRAFT"} />,
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Link href={`/admin/blogs/${row.id}/edit`} className="text-sm font-medium text-gold-dark hover:text-foreground">
                  Edit
                </Link>
                <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => togglePublished(row)}>
                  {row.published ? "Unpublish" : "Publish"}
                </button>
                <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => toggleArchiveBlog(row)}>
                  {row.archivedAt ? "Unarchive" : "Archive"}
                </button>
                <button className="text-sm text-red-600 hover:text-red-700" onClick={() => deleteBlog(row.id)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
