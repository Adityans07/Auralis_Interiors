"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { deleteAdminProduct, archiveAdminProduct, unarchiveAdminProduct, getAdminProducts } from "@/lib/services/adminService";
import type { AdminProduct } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    getAdminProducts({ page: 1, pageSize: 50, search, includeArchived: showArchived }).then((response) => {
      setItems(response.data.items);
    });
  }, [search, showArchived]);

  const toggleArchiveProduct = async (row: AdminProduct) => {
    if (row.archivedAt) {
      await unarchiveAdminProduct(row.id);
      setItems((current) => current.filter((item) => showArchived || item.id !== row.id).map(item => item.id === row.id ? { ...item, archivedAt: null } : item));
    } else {
      await archiveAdminProduct(row.id);
      setItems((current) => current.filter((item) => showArchived || item.id !== row.id).map(item => item.id === row.id ? { ...item, archivedAt: new Date().toISOString() } : item));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    await deleteAdminProduct(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage inventory that powers AI recommendations."
        actionLabel="Add Product"
        actionHref="/admin/products/new"
      />
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search name, vendor, category, city" />
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
        emptyTitle="No products found"
        columns={[
          { key: "name", header: "Product", render: (row) => row.name },
          { key: "category", header: "Category", render: (row) => row.category },
          { key: "itemType", header: "Item Type", render: (row) => row.itemType },
          { key: "price", header: "Price", render: (row) => `${row.currency} ${Math.round(row.price).toLocaleString()}` },
          { key: "location", header: "Location", render: (row) => `${row.city}, ${row.country}` },
          { key: "stock", header: "Stock", render: (row) => <AdminStatusBadge status={row.archivedAt ? "ARCHIVED" : row.stockStatus} /> },
          { key: "tags", header: "Style Tags", render: (row) => row.styleTags.slice(0, 2).join(", ") || "-" },
          { key: "vendor", header: "Vendor", render: (row) => row.vendorName ?? "-" },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Link href={`/admin/products/${row.id}/edit`} className="text-sm font-medium text-gold-dark hover:text-foreground">
                  Edit
                </Link>
                <button onClick={() => toggleArchiveProduct(row)} className="text-sm text-muted-foreground hover:text-foreground">
                  {row.archivedAt ? "Unarchive" : "Archive"}
                </button>
                <button onClick={() => deleteProduct(row.id)} className="text-sm text-red-600 hover:text-red-700">
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
