import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BillingSummaryProps {
  freeGenerationUsed: boolean;
}

export function BillingSummary({ freeGenerationUsed }: BillingSummaryProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gold/10 p-6 shadow-soft sm:p-8">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-gold-light">
            {freeGenerationUsed ? (
              <Sparkles className="h-6 w-6" aria-hidden />
            ) : (
              <Gift className="h-6 w-6" aria-hidden />
            )}
          </span>
          <div>
            <h3 className="font-serif text-xl font-semibold text-ink-900">
              {freeGenerationUsed
                ? "Your free generation has been used"
                : "Your first AI design generation is free"}
            </h3>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-600">
              {freeGenerationUsed
                ? "Additional AI design generations are billed at $19 each. Start a new request whenever you're ready."
                : "Try Auralis with a complimentary set of AI-generated concepts — no payment required to get started."}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Button href="/try-us">
            {freeGenerationUsed
              ? "Continue with a paid design request"
              : "Start your free design"}
            <Sparkles className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
