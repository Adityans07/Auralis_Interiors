"use client";

import { useEffect, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import type { CustomerPayment } from "@/lib/types";
import { accountService } from "@/lib/services/account";
import { AccountHeader } from "@/components/account/AccountHeader";
import { BillingSummary } from "@/components/account/BillingSummary";
import { PaymentHistoryCard } from "@/components/account/PaymentHistoryCard";

export default function BillingPage() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [freeGenerationUsed, setFreeGenerationUsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      accountService.getMyPayments(),
      accountService.getFreeGenerationStatus(),
    ])
      .then(([paymentsRes, statusRes]) => {
        if (!active) return;
        setPayments(paymentsRes.data);
        setFreeGenerationUsed(statusRes.data.hasUsedFreeGeneration);
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
        title="Billing & Payments"
        description="Your free generation status and payment history."
      />

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center rounded-3xl border border-white/10 bg-base/5 shadow-glow">
          <Loader2 className="h-6 w-6 animate-spin text-gold-dark" aria-hidden />
          <span className="sr-only">Loading billing details…</span>
        </div>
      ) : (
        <>
          <BillingSummary freeGenerationUsed={freeGenerationUsed} />

          <section>
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Payment history
            </h2>
            {payments.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-white/10 bg-base/5 p-12 text-center shadow-glow">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-gold-light">
                  <Receipt className="h-6 w-6" aria-hidden />
                </span>
                <p className="mt-5 text-sm text-muted-foreground">
                  You have no payments yet.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {payments.map((payment) => (
                  <PaymentHistoryCard key={payment.id} payment={payment} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
