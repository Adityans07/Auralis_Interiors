"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Store, MoreVertical, Edit2, Trash2, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { getAdminVendors, deleteAdminVendor } from "@/lib/services/adminService";
import type { AdminVendor } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [vendorToDelete, setVendorToDelete] = useState<AdminVendor | null>(null);

  const fetchVendors = () => {
    setLoading(true);
    getAdminVendors({ page: 1, pageSize: 50, search: search || undefined })
      .then((response) => {
        setVendors(response.data.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(fetchVendors, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDelete = async () => {
    if (!vendorToDelete) return;
    await deleteAdminVendor(vendorToDelete.id);
    setVendorToDelete(null);
    fetchVendors();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vendors"
        description="Manage product vendors and their inventories."
        actionLabel="Add Vendor"
        actionHref="/admin/vendors/new"
      />
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search vendors..." />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : vendors.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Store className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No vendors found</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Get started by adding your first vendor to organize products.
          </p>
          <Button as={Link} href="/admin/vendors/new" className="mt-6">
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {vendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-base p-6 transition-all hover:border-white/20 hover:bg-base/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 text-xl font-bold uppercase overflow-hidden">
                    {vendor.logoUrl ? (
                      <img src={vendor.logoUrl} alt={vendor.name} className="h-full w-full object-cover" />
                    ) : (
                      vendor.name.substring(0, 2)
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{vendor.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{vendor.productCount} Products</span>
                    </div>
                  </div>
                </div>
                <AdminStatusBadge status={vendor.status} />
              </div>

              {vendor.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">
                  {vendor.description}
                </p>
              )}

              <div className="mt-auto pt-4 flex items-center gap-2 border-t border-white/10">
                <Button
                  as={Link}
                  href={`/admin/vendors/${vendor.id}`}
                  variant="primary"
                  className="w-full text-xs h-9"
                >
                  Manage Products
                </Button>
                <div className="flex gap-1">
                  <Button
                    as={Link}
                    href={`/admin/vendors/${vendor.id}/edit`}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => setVendorToDelete(vendor)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {vendorToDelete && (
        <AdminConfirmDialog
          title="Delete Vendor"
          message={`Are you sure you want to delete ${vendorToDelete.name}? This vendor contains ${vendorToDelete.productCount} products. Deleting it will permanently remove all associated products.`}
          confirmLabel="Delete Everything"
          onConfirm={handleDelete}
          onCancel={() => setVendorToDelete(null)}
          destructive
        />
      )}
    </div>
  );
}
