"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, ArrowLeft, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { uploadImage } from "@/lib/services/api";
import { createAdminVendor, updateAdminVendor } from "@/lib/services/adminService";
import type { AdminVendor } from "@/lib/types/admin";

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  slug: z.string().min(2).max(255).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  contactPerson: z.string().max(255).optional().or(z.literal("")),
  email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  phone: z.string().max(80).optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface AdminVendorFormProps {
  initialData?: AdminVendor;
}

export function AdminVendorForm({ initialData }: AdminVendorFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      logoUrl: initialData?.logoUrl || "",
      bannerUrl: initialData?.bannerUrl || "",
      websiteUrl: initialData?.websiteUrl || "",
      description: initialData?.description || "",
      contactPerson: initialData?.contactPerson || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      status: initialData?.status || "ACTIVE",
    },
  });

  const logoUrl = watch("logoUrl");
  const bannerUrl = watch("bannerUrl");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setValue("name", newName, { shouldValidate: true });
    if (!initialData) {
      setValue("slug", generateSlug(newName), { shouldValidate: true });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logoUrl" | "bannerUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await uploadImage(file, { folder: "vendors" });
      setValue(field, response.url, { shouldValidate: true });
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    }
  };

  const onSubmit = async (data: VendorFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...data,
        logoUrl: data.logoUrl || null,
        bannerUrl: data.bannerUrl || null,
        websiteUrl: data.websiteUrl || null,
        description: data.description || null,
        contactPerson: data.contactPerson || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      };

      if (initialData) {
        await updateAdminVendor(initialData.id, payload);
      } else {
        await createAdminVendor(payload as any);
      }
      router.push("/admin/vendors");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-void/50 px-3 py-2 text-sm text-foreground focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button as={Link} href="/admin/vendors" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {initialData ? "Edit Vendor" : "Create Vendor"}
          </h1>
        </div>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData ? "Save Changes" : "Create Vendor"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-base p-6 space-y-6">
            <h2 className="text-lg font-medium text-foreground">General Information</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Vendor Name *</label>
                <input {...register("name")} onChange={handleNameChange} className={inputClass} placeholder="e.g., Amazon" />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Slug *</label>
                <input {...register("slug")} className={inputClass} placeholder="amazon" />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">Description</label>
              <textarea {...register("description")} rows={4} className={inputClass} placeholder="Brief description of the vendor..." />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Website URL</label>
                <input {...register("websiteUrl")} className={inputClass} placeholder="https://..." />
                {errors.websiteUrl && <p className="text-xs text-red-500">{errors.websiteUrl.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Status</label>
                <select {...register("status")} className={inputClass}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-base p-6 space-y-6">
            <h2 className="text-lg font-medium text-foreground">Contact Details</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Contact Person</label>
                <input {...register("contactPerson")} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Email</label>
                <input {...register("email")} type="email" className={inputClass} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Phone</label>
                <input {...register("phone")} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Address</label>
                <input {...register("address")} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-base p-6 space-y-6">
            <h2 className="text-lg font-medium text-foreground">Branding</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Logo Image</label>
                <div className="mt-1 flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-void/50 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "logoUrl")}
                      className="block w-full text-xs text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-white/5 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-foreground hover:file:bg-white/10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-foreground">Banner Image</label>
                <div className="mt-1 space-y-4">
                  <div className="relative h-24 w-full overflow-hidden rounded-xl border border-white/10 bg-void/50 flex items-center justify-center">
                    {bannerUrl ? (
                      <img src={bannerUrl} alt="Banner" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "bannerUrl")}
                    className="block w-full text-xs text-muted-foreground file:mr-4 file:rounded-full file:border-0 file:bg-white/5 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-foreground hover:file:bg-white/10"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
