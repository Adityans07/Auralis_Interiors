"use client";

import { useEffect, useState } from "react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { getAdminContactMessages, updateContactMessageStatus } from "@/lib/services/adminService";
import type { AdminContactMessage } from "@/lib/types/admin";

const STATUS_OPTIONS = ["NEW", "READ", "REPLIED"];

export default function AdminContactMessagesPage() {
  const [items, setItems] = useState<AdminContactMessage[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminContactMessages({ page: 1, pageSize: 50, search }).then((response) => {
      setItems(response.data.items);
    });
  }, [search]);

  const updateStatus = async (id: string, status: string) => {
    await updateContactMessageStatus(id, status);
    setItems((current) => current.map((row) => (row.id === id ? { ...row, status: status as never } : row)));
  };

  return (
    <div>
      <AdminPageHeader title="Contact Messages" description="Inbox for incoming customer inquiries." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search name, email, subject" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No messages found"
        columns={[
          { key: "name", header: "Name", render: (row) => row.name },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "phone", header: "Phone", render: (row) => row.phone ?? "-" },
          { key: "subject", header: "Subject", render: (row) => row.subject ?? "-" },
          { key: "preview", header: "Preview", render: (row) => row.messagePreview ?? row.message?.slice(0, 120) ?? "" },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          {
            key: "actions",
            header: "Update",
            render: (row) => (
              <select
                value={row.status}
                onChange={(event) => updateStatus(row.id, event.target.value)}
                className="h-9 rounded-lg border border-white/10 bg-base px-2 text-xs focus-ring"
              >
                {STATUS_OPTIONS.map((status) => (
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
