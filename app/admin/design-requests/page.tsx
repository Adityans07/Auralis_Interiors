"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminDesignRequests } from "@/lib/services/adminService";
import type { AdminDesignRequestListItem } from "@/lib/types/admin";

export default function AdminDesignRequestsPage() {
  const [items, setItems] = useState<AdminDesignRequestListItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminDesignRequests({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  return (
    <div>
      <AdminPageHeader title="Design Requests" description="Search and manage AI generation requests." />
      <AdminSearchFilters
        search={search}
        onSearchChange={setSearch}
        placeholder="Search by request ID, customer, email, city"
      />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No design requests found"
        columns={[
          { key: "id", header: "Request ID", render: (row) => row.id.slice(0, 10) },
          {
            key: "customer",
            header: "Customer",
            render: (row) => (
              <div>
                <p className="font-medium text-ink-900">{row.customer.name}</p>
                <p className="text-xs text-ink-500">{row.customer.email ?? "Guest"}</p>
              </div>
            ),
          },
          { key: "designType", header: "Design Type", render: (row) => row.designType },
          { key: "spaceType", header: "Space Type", render: (row) => row.spaceType },
          { key: "city", header: "City", render: (row) => row.city },
          { key: "budget", header: "Budget", render: (row) => `$${Math.round(row.budget).toLocaleString()}` },
          { key: "style", header: "Style", render: (row) => row.style },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          { key: "priority", header: "Priority", render: (row) => <AdminStatusBadge status={row.priority} /> },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <Link href={`/admin/design-requests/${row.id}`} className="text-sm font-medium text-gold-dark hover:text-ink-900">
                View
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
