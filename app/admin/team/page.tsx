"use client";

import { useEffect, useState } from "react";
import { backendRequest } from "@/lib/services/http";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
};

export default function AdminTeamPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    backendRequest<{ items: TeamMember[] }>(`/api/admin/team?page=1&pageSize=50&search=${encodeURIComponent(search)}`).then(
      (response) => setItems(response.data.items)
    );
  }, [search]);

  return (
    <div>
      <AdminPageHeader title="Team" description="Manage admin users and access." />
      <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search admin name or email" />

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No admin users"
        columns={[
          { key: "name", header: "Name", render: (row) => row.name },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "role", header: "Role", render: (row) => row.role },
          { key: "status", header: "Status", render: (row) => <AdminStatusBadge status={row.status} /> },
          { key: "created", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
