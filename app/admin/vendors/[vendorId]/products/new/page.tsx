"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { createAdminProduct } from "@/lib/services/adminService";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { vendorId } = useParams();
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <AdminPageHeader title="Create Product" description="Add a new catalog item for AI matching." />
      <AdminProductForm
        isSubmitting={saving}
        onSubmit={async (payload) => {
          setSaving(true);
          try {
            await createAdminProduct({ ...payload, vendorId } as never);
            router.refresh();
            router.push(`/admin/vendors/${vendorId}`);
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
