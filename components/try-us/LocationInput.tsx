"use client";

import type { LocationInfo } from "@/lib/types";
import { MapPin } from "lucide-react";

interface LocationInputProps {
  value: LocationInfo;
  onChange: (value: LocationInfo) => void;
  cityError?: string;
}

const SUPPORTED_CITIES = [
  { city: "Noida", state: "Uttar Pradesh", country: "India" },
  { city: "Prayagraj", state: "Uttar Pradesh", country: "India" },
  { city: "Patna", state: "Bihar", country: "India" },
  { city: "Jaipur", state: "Rajasthan", country: "India" },
  { city: "Chandigarh", state: "Chandigarh", country: "India" },
  { city: "Kolkata", state: "West Bengal", country: "India" },
];

export function LocationInput({ value, onChange, cityError }: LocationInputProps) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-foreground">
        Location <span className="text-gold-dark">*</span>
      </legend>
      <p className="mb-3 text-xs text-muted-foreground/80">
        We use this to match products available near you.
      </p>
      
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <select
          aria-invalid={!!cityError}
          className="h-12 w-full appearance-none rounded-xl border border-white/10 bg-void pl-12 pr-10 text-sm text-foreground focus-ring"
          value={value.city || ""}
          onChange={(e) => {
            const selected = SUPPORTED_CITIES.find((c) => c.city === e.target.value);
            if (selected) {
              onChange({
                ...value,
                city: selected.city,
                state: selected.state,
                country: selected.country,
                zip: "",
              });
            } else {
              onChange({ ...value, city: "", state: "", country: "", zip: "" });
            }
          }}
        >
          <option value="" disabled>Select a city...</option>
          {SUPPORTED_CITIES.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {value.city && value.state && (
        <p className="mt-3 text-sm text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{value.city}, {value.state}</span>
        </p>
      )}

      {cityError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {cityError}
        </p>
      )}
    </fieldset>
  );
}
