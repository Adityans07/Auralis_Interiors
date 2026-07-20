"use client";

import { useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminBookings, updateBookingStatus } from "@/lib/services/adminService";
import type { AdminBookingListItem } from "@/lib/types/admin";

const BOOKING_STATUSES = ["REQUESTED", "CONFIRMED", "COMPLETED", "CANCELLED"];

export default function AdminBookingsPage() {
  const [items, setItems] = useState<AdminBookingListItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminBookings({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  const setStatus = async (id: string, status: string) => {
    await updateBookingStatus(id, { status });
    setItems((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  return (
    <div>
      <AdminPageHeader title="Bookings" description="Confirm, complete, cancel, and reschedule bookings." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search by customer, email, phone, city" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No bookings found"
        columns={[
          { key: "id", header: "Booking ID", render: (row) => row.id.slice(0, 10) },
          {
            key: "customer",
            header: "Customer",
            render: (row) => (
              <div>
                <p className="font-medium text-ink-900">{row.customerName}</p>
                <p className="text-xs text-ink-500">{row.email}</p>
              </div>
            ),
          },
          { key: "phone", header: "Phone", render: (row) => row.phone },
          { key: "project", header: "Project Type", render: (row) => row.projectType },
          { key: "schedule", header: "Schedule", render: (row) => `${new Date(row.preferredDate).toLocaleDateString()} ${row.preferredTime}` },
          { key: "city", header: "City", render: (row) => row.city },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          {
            key: "actions",
            header: "Update",
            render: (row) => (
              <select
                value={row.status}
                onChange={(event) => setStatus(row.id, event.target.value)}
                className="h-9 rounded-lg border border-sand-200 bg-white px-2 text-xs focus-ring"
              >
                {BOOKING_STATUSES.map((status) => (
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
