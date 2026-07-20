"use client";

import { useEffect, useState } from "react";
import { Loader2, LayoutGrid } from "lucide-react";
import type { CustomerDesignRequest } from "@/lib/types";
import { accountService } from "@/lib/services/account";
import { AccountHeader } from "@/components/account/AccountHeader";
import { DesignHistoryCard } from "@/components/account/DesignHistoryCard";
import { Button } from "@/components/ui/Button";

export default function MyDesignsPage() {
  const [requests, setRequests] = useState<CustomerDesignRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    accountService
      .getMyDesignRequests()
      .then((res) => {
        if (active) setRequests(res.data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <AccountHeader
        title="My Designs"
        description="Every AI design request you've created, with its concepts and status."
      />

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center rounded-3xl border border-sand-200 bg-white/80 shadow-soft">
          <Loader2 className="h-6 w-6 animate-spin text-gold-dark" aria-hidden />
          <span className="sr-only">Loading your designs…</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-12 text-center shadow-soft">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-gold-light">
            <LayoutGrid className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="mt-5 font-serif text-xl font-semibold text-ink-900">
            You have not created any designs yet.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
            Start with a free set of AI-generated concepts tailored to your
            space and budget.
          </p>
          <div className="mt-6">
            <Button href="/try-us">Start your first design</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => (
            <DesignHistoryCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
