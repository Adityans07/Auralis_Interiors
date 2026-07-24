"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminVendorForm } from "@/components/admin/AdminVendorForm";
import { getAdminVendorById } from "@/lib/services/adminService";
import type { AdminVendor } from "@/lib/types/admin";

export default function EditVendorPage() {
  const { vendorId } = useParams();
  const router = useRouter();
  const [vendor, setVendor] = useState<AdminVendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    getAdminVendorById(vendorId as string)
      .then((res) => {
        setVendor(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load vendor");
        setLoading(false);
      });
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-red-500">{error || "Vendor not found"}</p>
      </div>
    );
  }

  return <AdminVendorForm initialData={vendor} />;
}
