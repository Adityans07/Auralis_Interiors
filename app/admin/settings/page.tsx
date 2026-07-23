"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getAdminSettings, updateAdminSettings } from "@/lib/services/adminService";
import type { AdminSettings } from "@/lib/types/admin";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminSettings().then((response) => setSettings(response.data));
  }, []);

  return (
    <div>
      <AdminPageHeader title="Admin Settings" description="Business and portal configuration." />
      <form
        className="grid gap-4 rounded-2xl border border-white/10 bg-base p-5 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          try {
            const response = await updateAdminSettings(settings);
            setSettings(response.data);
          } finally {
            setSaving(false);
          }
        }}
      >
        {[
          ["businessName", "Business Name"],
          ["supportEmail", "Support Email"],
          ["supportPhone", "Support Phone"],
          ["defaultCurrency", "Default Currency"],
          ["paidGenerationPrice", "Paid Generation Price (cents)"],
          ["adminNotificationEmail", "Admin Notification Email"],
          ["bookingAvailabilityNote", "Booking Note"],
          ["aiGenerationMode", "AI Generation Mode"],
        ].map(([key, label]) => (
          <label key={key} className="text-sm text-foreground/90">
            {label}
            <input
              value={String((settings as Record<string, unknown>)[key] ?? "")}
              onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))}
              className="mt-1 h-10 w-full rounded-xl border border-white/10 px-3 focus-ring"
            />
          </label>
        ))}

        <label className="inline-flex items-center gap-2 text-sm text-foreground/90">
          <input
            type="checkbox"
            checked={Boolean(settings.freeGenerationEnabled)}
            onChange={(event) => setSettings((current) => ({ ...current, freeGenerationEnabled: event.target.checked }))}
            className="h-4 w-4"
          />
          Free generation enabled
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-foreground/90">
          <input
            type="checkbox"
            checked={Boolean(settings.maintenanceMode)}
            onChange={(event) => setSettings((current) => ({ ...current, maintenanceMode: event.target.checked }))}
            className="h-4 w-4"
          />
          Maintenance mode (placeholder)
        </label>

        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
