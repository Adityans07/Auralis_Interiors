"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminCustomers } from "@/lib/services/adminService";
import type { AdminCustomerListItem } from "@/lib/types/admin";

export default function AdminCustomersPage() {
  const [items, setItems] = useState<AdminCustomerListItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminCustomers({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  return (
    <div>
      <AdminPageHeader title="Customers" description="View customer profiles, usage, and history." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search by name, email, phone" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No customers found"
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <div>
                <p className="font-medium text-ink-900">{row.name}</p>
                <p className="text-xs text-ink-500">{row.email}</p>
              </div>
            ),
          },
          { key: "phone", header: "Phone", render: (row) => row.phone ?? "-" },
          { key: "city", header: "City", render: (row) => row.city ?? "-" },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          { key: "verified", header: "Email Verified", render: (row) => (row.emailVerified ? "Yes" : "No") },
          { key: "free", header: "Free Gen Used", render: (row) => (row.freeGenerationUsed ? "Yes" : "No") },
          { key: "requests", header: "Requests", render: (row) => row.totalDesignRequests },
          { key: "bookings", header: "Bookings", render: (row) => row.totalBookings },
          { key: "payments", header: "Payments", render: (row) => row.totalPayments },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <Link href={`/admin/customers/${row.id}`} className="text-sm font-medium text-gold-dark hover:text-ink-900">
                View
              </Link>
            ),
          },
        ]}
      />
    </div>
  );
}
