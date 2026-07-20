"use client";

import { useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminPayments } from "@/lib/services/adminService";
import type { AdminPayment } from "@/lib/types/admin";

export default function AdminPaymentsPage() {
  const [items, setItems] = useState<AdminPayment[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminPayments({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  return (
    <div>
      <AdminPageHeader title="Payments" description="Read-only payment records and statuses." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search payment ID or stripe session" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No payment records"
        columns={[
          { key: "id", header: "Payment ID", render: (row) => row.id.slice(0, 10) },
          { key: "customer", header: "Customer", render: (row) => row.customer?.name ?? "Guest" },
          { key: "design", header: "Design Request", render: (row) => row.designRequestId?.slice(0, 10) ?? "-" },
          { key: "session", header: "Stripe Session", render: (row) => row.stripeSessionId.slice(0, 16) },
          { key: "amount", header: "Amount", render: (row) => `${row.currency} ${(row.amount / 100).toFixed(2)}` },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          { key: "date", header: "Created", render: (row) => new Date(row.createdAt).toLocaleString() },
        ]}
      />
    </div>
  );
}
