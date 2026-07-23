"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSearchFilters } from "@/components/admin/AdminSearchFilters";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { deleteAdminProduct, archiveAdminProduct, unarchiveAdminProduct, getAdminProducts } from "@/lib/services/adminService";
import type { AdminProduct } from "@/lib/types/admin";
import { Button } from "@/components/ui/Button";

export default function AdminProductsPage() {
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // Column Filters
  const [category, setCategory] = useState("");
  const [itemType, setItemType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [location, setLocation] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [tags, setTags] = useState("");
  const [vendor, setVendor] = useState("");

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setItemType("");
    setMinPrice("");
    setMaxPrice("");
    setLocation("");
    setStockStatus("");
    setTags("");
    setVendor("");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const params: Record<string, string | number | boolean | undefined> = {
        page: 1,
        pageSize: 50,
        search: search || undefined,
        includeArchived: showArchived,
        category: category || undefined,
        itemType: itemType || undefined,
        location: location || undefined,
        vendor: vendor || undefined,
        tags: tags || undefined,
        stockStatus: stockStatus || undefined,
      };
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);

      getAdminProducts(params).then((response) => {
        setItems(response.data.items);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, showArchived, category, itemType, minPrice, maxPrice, location, stockStatus, tags, vendor]);

  const toggleArchiveProduct = async (row: AdminProduct) => {
    if (row.archivedAt) {
      await unarchiveAdminProduct(row.id);
      setItems((current) => current.filter((item) => showArchived || item.id !== row.id).map(item => item.id === row.id ? { ...item, archivedAt: null } : item));
    } else {
      await archiveAdminProduct(row.id);
      setItems((current) => current.filter((item) => showArchived || item.id !== row.id).map(item => item.id === row.id ? { ...item, archivedAt: new Date().toISOString() } : item));
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    await deleteAdminProduct(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const inputClass = "h-8 w-full rounded border border-white/10 bg-void/50 px-2 text-xs text-foreground focus-ring placeholder:text-muted-foreground/50";

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage inventory that powers AI recommendations."
        actionLabel="Add Product"
        actionHref="/admin/products/new"
      />
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <AdminSearchFilters search={search} onSearchChange={setSearch} placeholder="Search anything globally..." />
        <div className="flex items-center gap-4">
          <button 
            onClick={clearFilters}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear Filters
          </button>
          <label className="flex items-center gap-2 text-sm text-foreground/90 cursor-pointer">
            <input 
              type="checkbox" 
              checked={showArchived} 
              onChange={(e) => setShowArchived(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-void/50 text-gold-dark focus:ring-gold-dark/50"
            />
            Show Archived
          </label>
        </div>
      </div>

      <AdminDataTable
        rows={items}
        rowKey={(row) => row.id}
        emptyTitle="No products found matching filters"
        columns={[
          { 
            key: "name", 
            header: "Product", 
            render: (row) => row.name,
            filterNode: <input placeholder="Filter name (use global search)" disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
          },
          { 
            key: "category", 
            header: "Category", 
            render: (row) => row.category,
            filterNode: <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Filter..." className={inputClass} />
          },
          { 
            key: "itemType", 
            header: "Item Type", 
            render: (row) => row.itemType,
            filterNode: <input value={itemType} onChange={(e) => setItemType(e.target.value)} placeholder="Filter..." className={inputClass} />
          },
          { 
            key: "price", 
            header: "Price", 
            render: (row) => `${row.currency} ${Math.round(row.price).toLocaleString()}`,
            filterNode: (
              <div className="flex gap-1 items-center">
                <input type="text" value={minPrice} onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Min" className={`${inputClass} w-16`} />
                <span className="text-muted-foreground">-</span>
                <input type="text" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Max" className={`${inputClass} w-16`} />
              </div>
            )
          },
          { 
            key: "location", 
            header: "Location", 
            render: (row) => `${row.city}, ${row.country}`,
            filterNode: <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Filter city/country..." className={inputClass} />
          },
          { 
            key: "stock", 
            header: "Stock", 
            render: (row) => <AdminStatusBadge status={row.archivedAt ? "ARCHIVED" : row.stockStatus} />,
            filterNode: (
              <select value={stockStatus} onChange={(e) => setStockStatus(e.target.value)} className={inputClass}>
                <option value="">All</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LIMITED">Limited</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            )
          },
          { 
            key: "tags", 
            header: "Style Tags", 
            render: (row) => row.styleTags.slice(0, 2).join(", ") || "-",
            filterNode: <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Filter tags..." className={inputClass} />
          },
          { 
            key: "vendor", 
            header: "Vendor", 
            render: (row) => row.vendorName ?? "-",
            filterNode: <input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Filter vendor..." className={inputClass} />
          },
          {
            key: "actions",
            header: "Actions",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Link href={`/admin/products/${row.id}/edit`} className="text-sm font-medium text-gold-dark hover:text-foreground">
                  Edit
                </Link>
                <button onClick={() => toggleArchiveProduct(row)} className="text-sm text-muted-foreground hover:text-foreground">
                  {row.archivedAt ? "Unarchive" : "Archive"}
                </button>
                <button onClick={() => deleteProduct(row.id)} className="text-sm text-red-600 hover:text-red-700">
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
