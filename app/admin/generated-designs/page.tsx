"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminGeneratedDesigns } from "@/lib/services/adminService";
import type { AdminGeneratedDesignListItem } from "@/lib/types/admin";

export default function AdminGeneratedDesignsPage() {
  const [items, setItems] = useState<AdminGeneratedDesignListItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminGeneratedDesigns({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  return (
    <div>
      <AdminPageHeader title="Generated Designs" description="All AI-generated concept options." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search title, style, request ID" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No generated designs"
        columns={[
          { key: "title", header: "Design Title", render: (row) => row.title },
          { key: "request", header: "Request", render: (row) => row.designRequestId.slice(0, 10) },
          { key: "customer", header: "Customer", render: (row) => row.customerName },
          { key: "style", header: "Style", render: (row) => row.style },
          { key: "estimate", header: "Estimated Total", render: (row) => `$${Math.round(row.estimatedTotal).toLocaleString()}` },
          { key: "budget", header: "Budget Status", render: (row) => <AdminStatusBadge status={row.budgetStatus} /> },
          { key: "products", header: "Products", render: (row) => row.productCount },
          { key: "selected", header: "Selected", render: (row) => (row.selected ? "Yes" : "No") },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <Link href={`/admin/design-requests/${row.designRequestId}`} className="text-sm font-medium text-gold-dark hover:text-foreground">
                View request
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
