"use client";

import type { LocationInfo } from "@/lib/types";

interface LocationInputProps {
  value: LocationInfo;
  onChange: (value: LocationInfo) => void;
  cityError?: string;
}

const fieldClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-void px-4 text-sm text-foreground focus-ring";

export function LocationInput({ value, onChange, cityError }: LocationInputProps) {
  const set = (patch: Partial<LocationInfo>) => onChange({ ...value, ...patch });

  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-foreground">
        Location <span className="text-gold-dark">*</span>
      </legend>
      <p className="mb-3 text-xs text-muted-foreground/80">
        We use this to match products available near you.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="loc-city" className="sr-only">City</label>
          <input
            id="loc-city"
            className={fieldClass}
            placeholder="City *"
            value={value.city}
            onChange={(e) => set({ city: e.target.value })}
            aria-invalid={!!cityError}
          />
        </div>
        <div>
          <label htmlFor="loc-state" className="sr-only">State / Region</label>
          <input
            id="loc-state"
            className={fieldClass}
            placeholder="State / Region"
            value={value.state ?? ""}
            onChange={(e) => set({ state: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="loc-country" className="sr-only">Country</label>
          <input
            id="loc-country"
            className={fieldClass}
            placeholder="Country"
            value={value.country}
            onChange={(e) => set({ country: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="loc-zip" className="sr-only">ZIP / Pincode</label>
          <input
            id="loc-zip"
            className={fieldClass}
            placeholder="ZIP / Pincode"
            value={value.zip ?? ""}
            onChange={(e) => set({ zip: e.target.value })}
          />
        </div>
      </div>
      {cityError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {cityError}
        </p>
      )}
    </fieldset>
  );
}
