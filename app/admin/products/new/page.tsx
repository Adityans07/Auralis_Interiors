"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { createAdminProduct } from "@/lib/services/adminService";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <AdminPageHeader title="Create Product" description="Add a new catalog item for AI matching." />
      <AdminProductForm
        isSubmitting={saving}
        onSubmit={async (payload) => {
          setSaving(true);
          try {
            await createAdminProduct(payload as never);
            router.refresh(); // Invalidate cache so changes persist in the list
            router.push("/admin/products");
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
