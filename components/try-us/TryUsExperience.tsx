"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import type {
  DesignGenerationPayload,
  DesignStyle,
  DesignType,
  GeneratedDesign,
  Mood,
  SpaceType,
  Timeline,
  TryUsFormData,
} from "@/lib/types";
import {
  DESIGN_TYPES,
  MOOD_OPTIONS,
  SPACE_TYPES,
  STYLE_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/constants";
import { humanize, cn } from "@/lib/utils";
import {
  createCheckoutSession,
  generateDesigns,
  getFreeGenerationStatus,
  uploadImage,
} from "@/lib/services/api";
import { ApiRequestError } from "@/lib/services/http";
import { useAuth } from "@/components/auth/AuthProvider";

import { Button } from "@/components/ui/Button";
import { FreeTrialBanner } from "./FreeTrialBanner";
import { SaveDesignPrompt } from "./SaveDesignPrompt";
import { PaidGenerationModal } from "./PaidGenerationModal";
import { UploadDropzone } from "./UploadDropzone";
import { BudgetInput } from "./BudgetInput";
import { LocationInput } from "./LocationInput";
import { ItemSelector } from "./ItemSelector";
import { LoadingGenerationAnimation } from "./LoadingGenerationAnimation";
import { DesignResultCard } from "./DesignResultCard";
import { DesignDetailsModal } from "./DesignDetailsModal";
import { DesignSelectionModal } from "./DesignSelectionModal";

type Phase = "form" | "generating" | "results";

const STEPS = ["Space", "Preferences", "Items", "Review"] as const;

const fieldClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-void px-4 text-sm text-foreground focus-ring";

function initialFormData(style?: DesignStyle): TryUsFormData {
  return {
    designType: "interior",
    spaceType: "living-room",
    description: "",
    style: style ?? "modern",
    budget: 0,
    currency: "USD",
    location: { city: "", state: "", country: "", zip: "" },
    selectedItems: [],
  };
}

export function TryUsExperience() {
  const searchParams = useSearchParams();
  const presetStyle = searchParams.get("style") as DesignStyle | null;
  const checkoutSessionId = searchParams.get("session_id") ?? undefined;
  const { isAuthenticated, customer, markFreeGenerationUsed } = useAuth();

  const [phase, setPhase] = useState<Phase>("form");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TryUsFormData>(() => initialFormData());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [results, setResults] = useState<GeneratedDesign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsDesign, setDetailsDesign] = useState<GeneratedDesign | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectionDesign, setSelectionDesign] = useState<GeneratedDesign | null>(null);
  const [selectionOpen, setSelectionOpen] = useState(false);

  const [spaceFile, setSpaceFile] = useState<File | null>(null);
  const [hasUsedFree, setHasUsedFree] = useState(false);
  const [freeStatusLoading, setFreeStatusLoading] = useState(true);
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallError, setPaywallError] = useState<string | null>(null);
  const [paywallBusy, setPaywallBusy] = useState(false);

  // Apply preset style from ?style= on mount.
  useEffect(() => {
    if (presetStyle) {
      setForm((f) => ({ ...f, style: presetStyle }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Backend is the source of truth for free/paid eligibility.
  useEffect(() => {
    let active = true;

    const loadFreeStatus = async () => {
      setFreeStatusLoading(true);
      try {
        const response = await getFreeGenerationStatus();
        if (!active) return;
        setHasUsedFree(
          Boolean(response.data.hasUsedFreeGeneration ?? response.data.freeGenerationUsed)
        );
      } catch {
        if (!active) return;
        // Fall back to the current auth hint if backend status cannot be read.
        setHasUsedFree(Boolean(customer?.freeGenerationUsed));
      } finally {
        if (active) setFreeStatusLoading(false);
      }
    };

    void loadFreeStatus();
    return () => {
      active = false;
    };
  }, [customer?.freeGenerationUsed, isAuthenticated]);

  const update = (patch: Partial<TryUsFormData>) =>
    setForm((f) => ({ ...f, ...patch }));

  /* --------------------------- Validation ---------------------------- */

  const validateStep = (index: number): boolean => {
    const e: Record<string, string> = {};
    if (index === 0) {
      if (!form.imagePreviewUrl && !form.description?.trim()) {
        e.space = "Please upload an image or describe your space.";
      }
    }
    if (index === 1) {
      if (!form.budget || form.budget <= 0) e.budget = "Enter a budget greater than 0.";
      if (!form.location.city.trim()) e.city = "City is required.";
    }
    if (index === 2) {
      if (form.selectedItems.length === 0)
        e.items = "Select at least one item to include.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  /* --------------------------- Generation ---------------------------- */

  const buildPayload = (): DesignGenerationPayload => ({
    designType: form.designType,
    spaceType: form.spaceType,
    description: form.description,
    imageName: form.imageName,
    uploadedImageUrl: form.uploadedImageUrl,
    uploadedImageKey: form.uploadedImageKey,
    style: form.style,
    mood: form.mood,
    colorPreferences: form.colorPreferences,
    budget: form.budget,
    currency: form.currency,
    location: form.location,
    timeline: form.timeline,
    selectedItems: form.selectedItems,
    extraNotes: form.extraNotes,
    stripeCheckoutSessionId: checkoutSessionId,
  });

  const runGeneration = async (paymentId?: string) => {
    setPhase("generating");
    setErrors({});
    try {
      let uploadedImageUrl = form.uploadedImageUrl;
      let uploadedImageKey = form.uploadedImageKey;

      if (spaceFile && (!uploadedImageUrl || !uploadedImageKey)) {
        const uploaded = await uploadImage(spaceFile);
        uploadedImageUrl = uploaded.data.imageUrl;
        uploadedImageKey = uploaded.data.imageKey;
        setForm((prev) => ({
          ...prev,
          uploadedImageUrl,
          uploadedImageKey,
        }));
      }

      const payload = {
        ...buildPayload(),
        uploadedImageUrl,
        uploadedImageKey,
        paymentId,
      };

      const res = await generateDesigns(payload);
      if (!paymentId) {
        setHasUsedFree(true);
        if (isAuthenticated) {
          markFreeGenerationUsed();
        }
      }

      setResults(res.data);
      setPhase("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setPhase("form");
      if (error instanceof ApiRequestError) {
        if (error.code === "PAYMENT_REQUIRED") {
          setPaywallOpen(true);
          setPaywallError("Your free generation has been used. Complete payment to continue.");
          return;
        }
        setErrors({ generate: error.message || "Something went wrong. Please try again." });
        return;
      }
      setErrors({ generate: error instanceof Error ? error.message : "Something went wrong. Please try again." });
    }
  };

  const handleGenerate = () => {
    if (!validateStep(1)) {
      setStep(1);
      return;
    }
    if (!validateStep(2)) {
      setStep(2);
      return;
    }
    const requiresPaidFlow = hasUsedFree && !checkoutSessionId;
    if (requiresPaidFlow) {
      setPaywallOpen(true);
      return;
    }
    void runGeneration();
  };

  const handleContinueToPayment = async () => {
    setPaywallBusy(true);
    setPaywallError(null);
    try {
      const checkout = await createCheckoutSession({
        currency: form.currency,
        designGenerationPayload: {
          designType: form.designType,
          spaceType: form.spaceType,
          style: form.style,
          budget: form.budget,
        },
      });

      const checkoutUrl = checkout.data.checkoutUrl;
      if (!checkoutUrl) {
        setPaywallError("Checkout link is unavailable. Please try again.");
        return;
      }

      if (typeof window !== "undefined") {
        window.location.assign(checkoutUrl);
      }
    } catch (error) {
      setPaywallError(
        error instanceof Error
          ? error.message
          : "Could not start checkout right now."
      );
    } finally {
      setPaywallBusy(false);
    }
  };

  /* ----------------------------- Results ----------------------------- */

  const toggleProduct = (designId: string, productId: string) => {
    setResults((prev) =>
      prev.map((d) =>
        d.id === designId
          ? {
              ...d,
              products: d.products.map((p) =>
                p.id === productId ? { ...p, included: !p.included } : p
              ),
            }
          : d
      )
    );
  };

  // Keep modal designs in sync with toggles.
  const syncedDetails = useMemo(
    () => results.find((d) => d.id === detailsDesign?.id) ?? null,
    [results, detailsDesign]
  );
  const syncedSelection = useMemo(
    () => results.find((d) => d.id === selectionDesign?.id) ?? null,
    [results, selectionDesign]
  );

  const openDetails = (d: GeneratedDesign) => {
    setDetailsDesign(d);
    setDetailsOpen(true);
  };
  const openSelection = (d: GeneratedDesign) => {
    setSelectedId(d.id);
    setSelectionDesign(d);
    setDetailsOpen(false);
    setSelectionOpen(true);
  };

  const startOver = () => {
    setPhase("form");
    setStep(0);
    setForm(initialFormData(presetStyle ?? undefined));
    setResults([]);
    setSelectedId(null);
    setSpaceFile(null);
    setErrors({});
  };

  /* ------------------------------ Render ----------------------------- */

  if (phase === "generating") {
    return <LoadingGenerationAnimation />;
  }

  if (phase === "results") {
    return (
      <div>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="eyebrow mb-2">Your concepts</span>
            <h2 className="text-3xl font-semibold text-foreground">
              {results.length} designs, tailored to you
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Toggle products to fit your budget, explore the details, then
              select your favorite.
            </p>
          </div>
          <Button variant="outline" onClick={startOver}>
            <RotateCcw className="h-4 w-4" /> Start over
          </Button>
        </div>

        {/* Save-to-account messaging (guest prompt vs logged-in confirmation) */}
        {isAuthenticated ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
            <Check className="h-5 w-5 shrink-0" />
            These designs are saved to your account. View them anytime under My
            Designs.
          </div>
        ) : (
          <div className="mt-6">
            <SaveDesignPrompt />
          </div>
        )}

        {selectedId && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-5 py-4 text-sm text-foreground"
          >
            <Check className="h-5 w-5 text-gold-dark" />
            Great choice — your selection is saved. Our team will contact you to
            finalize the deal.
          </motion.div>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {results.map((d, i) => (
            <DesignResultCard
              key={d.id}
              design={d}
              budget={form.budget}
              index={i}
              isSelected={selectedId === d.id}
              onToggleProduct={toggleProduct}
              onViewDetails={openDetails}
              onSelect={openSelection}
            />
          ))}
        </div>

        <DesignDetailsModal
          design={syncedDetails}
          budget={form.budget}
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          onToggleProduct={toggleProduct}
          onSelect={openSelection}
        />
        <DesignSelectionModal
          design={syncedSelection}
          open={selectionOpen}
          onClose={() => setSelectionOpen(false)}
          isAuthenticated={isAuthenticated}
          prefill={
            customer
              ? { name: customer.name, email: customer.email, phone: customer.phone }
              : undefined
          }
        />
      </div>
    );
  }

  /* ------------------------- Form (phase form) ----------------------- */

  return (
    <div>
      <FreeTrialBanner
        isAuthenticated={isAuthenticated}
        hasUsedFree={hasUsedFree}
        loading={freeStatusLoading}
      />

      {/* Stepper */}
      <ol className="mt-8 flex items-center gap-2">
        {STEPS.map((label, i) => {
          const state = i < step ? "done" : i === step ? "current" : "todo";
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                  state === "done" && "bg-emerald-500 text-white",
                  state === "current" && "bg-base/10 text-gold-light",
                  state === "todo" && "bg-white/10 text-muted-foreground/80"
                )}
                aria-current={state === "current" ? "step" : undefined}
              >
                {state === "done" ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  state === "current" ? "text-foreground" : "text-muted-foreground/80"
                )}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 hidden h-px flex-1 bg-white/10 sm:block" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 rounded-3xl border border-white/10 bg-void/5 p-6 shadow-glow sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <StepSpace
                form={form}
                update={update}
                error={errors.space}
                onFileChange={(file) => setSpaceFile(file)}
              />
            )}
            {step === 1 && (
              <StepPreferences form={form} update={update} budgetError={errors.budget} cityError={errors.city} />
            )}
            {step === 2 && (
              <ItemSelector
                designType={form.designType}
                selected={form.selectedItems}
                onChange={(items) => update({ selectedItems: items })}
                error={errors.items}
              />
            )}
            {step === 3 && <StepReview form={form} update={update} />}
          </motion.div>
        </AnimatePresence>

        {errors.generate && (
          <p role="alert" className="mt-4 text-sm text-red-600">
            {errors.generate}
          </p>
        )}

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="secondary" size="lg" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" /> Generate My Designs
            </Button>
          )}
        </div>
      </div>

      <PaidGenerationModal
        open={paywallOpen}
        onClose={() => {
          setPaywallOpen(false);
          setPaywallError(null);
        }}
        onContinueToPayment={handleContinueToPayment}
        busy={paywallBusy}
        error={paywallError}
      />
    </div>
  );
}

/* ============================ Step 1: Space =========================== */

function StepSpace({
  form,
  update,
  error,
  onFileChange,
}: {
  form: TryUsFormData;
  update: (p: Partial<TryUsFormData>) => void;
  error?: string;
  onFileChange: (file: File | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Tell us about your space</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a photo or describe it — whichever is easier.
        </p>
      </div>

      <UploadDropzone
        previewUrl={form.imagePreviewUrl}
        fileName={form.imageName}
        onChange={({ previewUrl, fileName, file }) => {
          onFileChange(file ?? null);
          update({
            imagePreviewUrl: previewUrl,
            imageName: fileName,
            uploadedImageUrl: undefined,
            uploadedImageKey: undefined,
          });
        }}
      />

      <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground/80">
        <span className="h-px flex-1 bg-white/10" /> or describe it{" "}
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <div>
        <label htmlFor="description" className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
          <ImageIcon className="h-4 w-4 text-gold-dark" /> Describe your space
        </label>
        <textarea
          id="description"
          rows={3}
          value={form.description ?? ""}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="e.g. A north-facing living room, ~18m², bare walls, lots of daylight…"
          className="w-full rounded-2xl border border-white/10 bg-void px-4 py-3 text-sm text-foreground focus-ring"
        />
      </div>

      {/* Design type */}
      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          Design type <span className="text-gold-dark">*</span>
        </span>
        <div className="grid grid-cols-2 gap-3">
          {DESIGN_TYPES.map((dt) => (
            <button
              key={dt.value}
              type="button"
              onClick={() => update({ designType: dt.value as DesignType, selectedItems: [] })}
              aria-pressed={form.designType === dt.value}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all",
                form.designType === dt.value
                  ? "border-white/20 bg-base/10 text-foreground"
                  : "border-white/10 bg-void hover:border-white/20"
              )}
            >
              <span className="block text-sm font-semibold">{dt.label}</span>
              <span
                className={cn(
                  "mt-1 block text-xs",
                  form.designType === dt.value ? "text-muted-foreground" : "text-muted-foreground"
                )}
              >
                {dt.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Space type + size + condition */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="spaceType" className="mb-2 block text-sm font-medium text-foreground">
            Space type <span className="text-gold-dark">*</span>
          </label>
          <select
            id="spaceType"
            value={form.spaceType}
            onChange={(e) => update({ spaceType: e.target.value as SpaceType })}
            className={fieldClass}
          >
            {SPACE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="approxSize" className="mb-2 block text-sm font-medium text-foreground">
            Approximate size (optional)
          </label>
          <input
            id="approxSize"
            className={fieldClass}
            placeholder="e.g. 18 m² / 200 sq ft"
            value={form.approxSize ?? ""}
            onChange={(e) => update({ approxSize: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="condition" className="mb-2 block text-sm font-medium text-foreground">
          Existing condition notes (optional)
        </label>
        <input
          id="condition"
          className={fieldClass}
          placeholder="e.g. Freshly painted, hardwood floors, keeping the sofa…"
          value={form.conditionNotes ?? ""}
          onChange={(e) => update({ conditionNotes: e.target.value })}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* ========================= Step 2: Preferences ======================== */

function StepPreferences({
  form,
  update,
  budgetError,
  cityError,
}: {
  form: TryUsFormData;
  update: (p: Partial<TryUsFormData>) => void;
  budgetError?: string;
  cityError?: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Your preferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the style, budget and location so we can tailor your concepts.
        </p>
      </div>

      {/* Style */}
      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          Preferred style <span className="text-gold-dark">*</span>
        </span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {STYLE_OPTIONS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => update({ style: s.value })}
              aria-pressed={form.style === s.value}
              className={cn(
                "rounded-2xl border px-3 py-2.5 text-sm font-medium transition-all",
                form.style === s.value
                  ? "border-white/20 bg-base/10 text-foreground"
                  : "border-white/10 bg-void text-foreground/90 hover:border-white/20"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood + colors */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="mb-2 block text-sm font-medium text-foreground">Mood</span>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => update({ mood: m.value as Mood })}
                aria-pressed={form.mood === m.value}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  form.mood === m.value
                    ? "border-gold bg-gold text-foreground"
                    : "border-white/20 bg-void text-muted-foreground hover:border-white/20"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="colors" className="mb-2 block text-sm font-medium text-foreground">
            Color preferences
          </label>
          <input
            id="colors"
            className={fieldClass}
            placeholder="e.g. Warm neutrals, deep green accents"
            value={form.colorPreferences ?? ""}
            onChange={(e) => update({ colorPreferences: e.target.value })}
          />
        </div>
      </div>

      <BudgetInput
        value={form.budget}
        onChange={(v) => update({ budget: v })}
        error={budgetError}
      />

      <LocationInput
        value={form.location}
        onChange={(loc) => update({ location: loc })}
        cityError={cityError}
      />

      {/* Timeline */}
      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">Timeline</span>
        <div className="flex flex-wrap gap-2">
          {TIMELINE_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => update({ timeline: t.value as Timeline })}
              aria-pressed={form.timeline === t.value}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                form.timeline === t.value
                  ? "border-white/20 bg-base/10 text-foreground"
                  : "border-white/20 bg-void text-muted-foreground hover:border-white/20"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================== Step 4: Review =========================== */

function StepReview({
  form,
  update,
}: {
  form: TryUsFormData;
  update: (p: Partial<TryUsFormData>) => void;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Design type", value: humanize(form.designType) },
    { label: "Space type", value: humanize(form.spaceType) },
    { label: "Style", value: humanize(form.style) },
    { label: "Mood", value: form.mood ? humanize(form.mood) : "—" },
    {
      label: "Budget",
      value: form.budget ? `$${form.budget.toLocaleString()}` : "—",
    },
    {
      label: "Location",
      value:
        [form.location.city, form.location.state, form.location.country]
          .filter(Boolean)
          .join(", ") || "—",
    },
    { label: "Timeline", value: form.timeline ? humanize(form.timeline) : "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Review & generate</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm your brief. You can go back to edit anything.
        </p>
      </div>

      {/* Space preview / description */}
      <div className="rounded-2xl border border-white/10 bg-void p-4">
        {form.imagePreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.imagePreviewUrl}
            alt="Your uploaded space"
            className="mb-3 aspect-video w-full rounded-xl object-cover"
          />
        ) : null}
        {form.description ? (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Description: </span>
            {form.description}
          </p>
        ) : !form.imagePreviewUrl ? (
          <p className="text-sm text-muted-foreground/80">No image or description provided.</p>
        ) : null}
      </div>

      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between border-b border-white/10 pb-2">
            <dt className="text-sm text-muted-foreground/80">{r.label}</dt>
            <dd className="text-sm font-medium text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div>
        <p className="mb-2 text-sm text-muted-foreground/80">
          Selected items ({form.selectedItems.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {form.selectedItems.length ? (
            form.selectedItems.map((i) => (
              <span
                key={i.id}
                className="rounded-full bg-base/10 px-3 py-1 text-xs font-medium text-foreground/90"
              >
                {i.label}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground/80">None selected.</span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="extraNotes" className="mb-2 block text-sm font-medium text-foreground">
          Extra notes (optional)
        </label>
        <textarea
          id="extraNotes"
          rows={3}
          value={form.extraNotes ?? ""}
          onChange={(e) => update({ extraNotes: e.target.value })}
          placeholder="Anything else we should know before generating your designs?"
          className="w-full rounded-2xl border border-white/10 bg-void px-4 py-3 text-sm text-foreground focus-ring"
        />
      </div>
    </div>
  );
}
