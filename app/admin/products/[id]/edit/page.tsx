"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminProductForm } from "@/components/admin/AdminProductForm";
import { getAdminProductById, updateAdminProduct } from "@/lib/services/adminService";
import type { AdminProduct } from "@/lib/types/admin";

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    getAdminProductById(params.id).then((response) => {
      setProduct(response.data);
    });
  }, [params?.id]);

  if (!product) {
    return <p className="text-sm text-ink-500">Loading product...</p>;
  }

  return (
    <div>
      <AdminPageHeader title={`Edit Product ${product.name}`} description="Update product fields and inventory metadata." />
      <AdminProductForm
        initial={product}
        isSubmitting={saving}
        onSubmit={async (payload) => {
          setSaving(true);
          try {
            await updateAdminProduct(product.id, payload as never);
            router.push("/admin/products");
          } finally {
            setSaving(false);
          }
        }}
      />
    </div>
  );
}
