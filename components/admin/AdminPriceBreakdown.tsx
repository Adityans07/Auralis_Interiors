import { formatCurrency } from "@/lib/utils";

export function AdminPriceBreakdown({
  items,
  currency = "USD",
}: {
  items: Array<{ label: string; amount: number }>;
  currency?: string;
}) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <section className="rounded-2xl border border-white/10 bg-base p-5">
      <h3 className="text-base font-semibold text-foreground">Price Breakdown</h3>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between text-foreground/90">
            <span>{item.label}</span>
            <span>{formatCurrency(item.amount, currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm font-semibold text-foreground">
        <span>Total</span>
        <span>{formatCurrency(total, currency)}</span>
      </div>
    </section>
  );
}
