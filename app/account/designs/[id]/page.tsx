"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ImageOff, Loader2, MapPin, Star } from "lucide-react";
import type { CustomerDesignRequest } from "@/lib/types";
import { accountService } from "@/lib/services/account";
import { BudgetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductPriceList } from "@/components/try-us/ProductPriceList";
import { PriceBreakdown } from "@/components/try-us/PriceBreakdown";
import { cn, formatCurrency, humanize } from "@/lib/utils";

export default function DesignRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [request, setRequest] = useState<CustomerDesignRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    accountService
      .getDesignRequestById(id)
      .then((res) => {
        if (active) setRequest(res.data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold-dark" aria-hidden />
        <span className="sr-only">Loading design request…</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="rounded-3xl border border-sand-200 bg-white/80 p-12 text-center shadow-soft">
        <h1 className="font-serif text-2xl font-semibold text-ink-900">
          Design request not found.
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
          This design request may have been removed or the link is incorrect.
        </p>
        <div className="mt-6">
          <Button href="/account/designs" variant="outline">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to my designs
          </Button>
        </div>
      </div>
    );
  }

  const { location } = request;
  const locationLabel = [location.city, location.state, location.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-8">
      <Link
        href="/account/designs"
        className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-medium text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> Back to my designs
      </Link>

      {/* Request details */}
      <section className="rounded-3xl border border-sand-200 bg-white/80 p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-ink-400">
              {request.id}
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-ink-900">
              {humanize(request.spaceType)} · {humanize(request.style)}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
              <MapPin className="h-4 w-4" aria-hidden /> {locationLabel}
            </p>
          </div>
          <Button href={`/booking?design=${encodeURIComponent(request.id)}`}>
            Book consultation
          </Button>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-sand-200 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">
              Design type
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">
              {humanize(request.designType)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">
              Space
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">
              {humanize(request.spaceType)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">
              Style
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">
              {humanize(request.style)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-400">
              Budget
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">
              {formatCurrency(request.budget, request.currency)}
            </dd>
          </div>
        </dl>

        <div className="mt-6">
          <dt className="text-xs uppercase tracking-wide text-ink-400">
            Description
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-ink-600">
            {request.description || "No description provided."}
          </dd>
        </div>

        {request.selectedItems.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-ink-400">
              Selected items
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {request.selectedItems.map((item) => (
                <li
                  key={item.id}
                  className="inline-flex items-center rounded-full border border-sand-200 bg-sand-50 px-3 py-1 text-xs font-medium text-ink-600"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Generated concepts */}
      <section className="space-y-5">
        <h2 className="font-serif text-xl font-semibold text-ink-900">
          Design concepts
        </h2>

        {request.generatedDesigns.length === 0 ? (
          <div className="rounded-3xl border border-sand-200 bg-white/80 p-8 text-center shadow-soft">
            <p className="text-sm text-ink-500">
              No design concepts have been generated for this request yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {request.generatedDesigns.map((design) => {
              const isSelected = design.id === request.selectedDesignId;
              return (
                <article
                  key={design.id}
                  className={cn(
                    "overflow-hidden rounded-3xl border bg-white/80 shadow-soft",
                    isSelected ? "border-gold/50 ring-1 ring-gold/40" : "border-sand-200"
                  )}
                >
                  <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative aspect-[16/10] overflow-hidden bg-sand-100 lg:aspect-auto">
                      {design.previewImage ? (
                        <Image
                          src={design.previewImage}
                          alt={`Preview of the ${design.title} concept`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 55vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-300">
                          <ImageOff className="h-8 w-8" aria-hidden />
                        </div>
                      )}
                      {isSelected && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/15 px-3 py-1 text-xs font-medium text-gold-dark">
                          <Star className="h-3.5 w-3.5" aria-hidden /> Selected
                        </span>
                      )}
                    </div>

                    <div className="p-5 lg:py-6 lg:pr-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-lg font-semibold text-ink-900">
                            {design.title}
                          </h3>
                          <p className="mt-0.5 text-sm text-ink-500">
                            {humanize(design.style)}
                          </p>
                        </div>
                        <BudgetBadge status={design.budgetStatus} />
                      </div>

                      {design.description && (
                        <p className="mt-3 text-sm leading-relaxed text-ink-600">
                          {design.description}
                        </p>
                      )}

                      <div className="mt-5 space-y-4">
                        <ProductPriceList
                          products={design.products}
                          onToggle={() => {}}
                          compact
                        />
                        <PriceBreakdown
                          products={design.products}
                          currency={design.currency}
                          budget={request.budget}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
