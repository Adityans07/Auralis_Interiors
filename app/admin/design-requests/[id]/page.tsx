"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminImagePreview } from "@/components/admin/AdminImagePreview";
import { AdminNotesPanel } from "@/components/admin/AdminNotesPanel";
import { AdminActivityTimeline } from "@/components/admin/AdminActivityTimeline";
import { getAdminDesignRequestById } from "@/lib/services/adminService";
import type { AdminDesignRequestDetail } from "@/lib/types/admin";

export default function AdminDesignRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AdminDesignRequestDetail | null>(null);

  useEffect(() => {
    if (!params?.id) return;
    getAdminDesignRequestById(params.id).then((response) => setData(response.data));
  }, [params?.id]);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Loading request...</p>;
  }

  const request = data.designRequest as Record<string, unknown>;
  const generatedDesigns = Array.isArray(request.designs) ? request.designs : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader title={`Design Request ${String(request.id ?? "")}`} description="Review request details and AI generation outcomes." />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-base p-5">
          <h3 className="text-base font-semibold text-foreground">Request Summary</h3>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm text-foreground/90">
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Status</dt>
              <dd>
                <AdminStatusBadge status={String(request.status ?? "DRAFT")} />
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Design Type</dt>
              <dd>{String(request.designType ?? "-")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Space Type</dt>
              <dd>{String(request.spaceType ?? "-")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Style</dt>
              <dd>{String(request.style ?? "-")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Location</dt>
              <dd>{String(request.city ?? "")}, {String(request.country ?? "")}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Budget</dt>
              <dd>${Math.round(Number(request.budget ?? 0)).toLocaleString()}</dd>
            </div>
          </dl>
          <p className="mt-4 text-sm text-foreground/90">{String(request.description ?? "No description.")}</p>
        </article>

        <AdminImagePreview src={typeof request.uploadedImageUrl === "string" ? request.uploadedImageUrl : null} alt="Uploaded reference" />
      </section>

      <section className="rounded-2xl border border-white/10 bg-base p-5">
        <h3 className="text-base font-semibold text-foreground">Generated Designs ({generatedDesigns.length})</h3>
        {generatedDesigns.length ? (
          <ul className="mt-3 space-y-3 text-sm text-foreground/90">
            {generatedDesigns.map((design) => {
              const item = design as Record<string, unknown>;
              return (
                <li key={String(item.id)} className="rounded-xl border border-sand-100 bg-void p-3">
                  <p className="font-medium text-foreground">{String(item.title ?? "Untitled")}</p>
                  <p className="text-xs text-muted-foreground">{String(item.style ?? "")} · ${Math.round(Number(item.estimatedTotal ?? 0)).toLocaleString()}</p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No generated designs yet.</p>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminNotesPanel notes={data.notes} />
        <AdminActivityTimeline
          events={data.aiLogs.map((log) => ({
            id: log.id,
            label: `${log.status}${log.errorCode ? ` · ${log.errorCode}` : ""}`,
            createdAt: log.createdAt,
          }))}
        />
      </section>

      {data.selectedDesign ? (
        <section className="rounded-2xl border border-white/10 bg-base p-5">
          <h3 className="text-base font-semibold text-foreground">Selected Design Lead</h3>
          <p className="mt-2 text-sm text-foreground/90">Customer: {String(data.selectedDesign.customerName ?? "-")}</p>
          <p className="text-sm text-foreground/90">Email: {String(data.selectedDesign.customerEmail ?? "-")}</p>
          <Link href="/admin/selected-designs" className="mt-3 inline-flex text-sm font-medium text-gold-dark hover:text-foreground">
            Open leads list
          </Link>
        </section>
      ) : null}
    </div>
  );
}
