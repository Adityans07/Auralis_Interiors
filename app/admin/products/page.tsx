"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { deleteAdminProduct, getAdminProducts } from "@/lib/services/adminService";
import type { AdminProduct } from "@/lib/types/admin";

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminProducts({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  const archiveProduct = async (id: string) => {
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
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search name, vendor, category, city" />

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
          { key: "stock", header: "Stock", render: (row) => <AdminStatusBadge status={row.stockStatus} /> },
          { key: "tags", header: "Style Tags", render: (row) => row.styleTags.slice(0, 2).join(", ") || "-" },
          { key: "vendor", header: "Vendor", render: (row) => row.vendorName ?? "-" },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Link href={`/admin/products/${row.id}/edit`} className="text-sm font-medium text-gold-dark hover:text-ink-900">
                  Edit
                </Link>
                <button onClick={() => archiveProduct(row.id)} className="text-sm text-red-600 hover:text-red-700">
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
