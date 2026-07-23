"use client";

import { useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminSelectedDesigns, updateSelectedDesignStatus } from "@/lib/services/adminService";
import type { AdminSelectedDesignListItem } from "@/lib/types/admin";

const LEAD_STATUSES = ["NEW", "CONTACTED", "CONSULTATION_BOOKED", "DEAL_FINALIZED", "LOST"];

export default function AdminSelectedDesignsPage() {
  const [items, setItems] = useState<AdminSelectedDesignListItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminSelectedDesigns({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  const setStatus = async (id: string, status: string) => {
    await updateSelectedDesignStatus(id, status);
    setItems((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  return (
    <div>
      <AdminPageHeader title="Selected Designs / Leads" description="Track and convert selected design leads." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search customer, email, phone" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No leads yet"
        columns={[
          { key: "id", header: "Lead ID", render: (row) => row.id.slice(0, 10) },
          {
            key: "customer",
            header: "Customer",
            render: (row) => (
              <div>
                <p className="font-medium text-foreground">{row.customerName}</p>
                <p className="text-xs text-muted-foreground">{row.email}</p>
              </div>
            ),
          },
          { key: "phone", header: "Phone", render: (row) => row.phone },
          { key: "design", header: "Selected Design", render: (row) => row.selectedDesignId.slice(0, 10) },
          { key: "estimate", header: "Estimated Total", render: (row) => `$${Math.round(row.finalEstimatedTotal).toLocaleString()}` },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          {
            key: "update",
            header: "Update",
            render: (row) => (
              <select
                value={row.status}
                onChange={(event) => setStatus(row.id, event.target.value)}
                className="h-9 rounded-lg border border-white/10 bg-base px-2 text-xs focus-ring"
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            ),
          },
        ]}
      />
    </div>
  );
}
