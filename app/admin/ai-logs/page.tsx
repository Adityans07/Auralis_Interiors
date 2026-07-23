"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminAiLogs } from "@/lib/services/adminService";
import type { AdminAiLog } from "@/lib/types/admin";

export default function AdminAiLogsPage() {
  const [items, setItems] = useState<AdminAiLog[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminAiLogs({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  return (
    <div>
      <AdminPageHeader title="AI Logs" description="Review generation failures and retry traces." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search request ID, error code, error text" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No AI logs"
        columns={[
          { key: "request", header: "Request", render: (row) => row.designRequestId.slice(0, 10) },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          { key: "code", header: "Error Code", render: (row) => row.errorCode ?? "-" },
          { key: "message", header: "Error Message", render: (row) => row.errorMessage ?? "-" },
          { key: "model", header: "Model", render: (row) => row.modelText ?? "-" },
          { key: "tokens", header: "Tokens", render: (row) => (row.totalTokens ?? 0).toString() },
          { key: "date", header: "Created", render: (row) => new Date(row.createdAt).toLocaleString() },
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
