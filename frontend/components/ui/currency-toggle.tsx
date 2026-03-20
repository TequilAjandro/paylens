"use client";

import { Button } from "@/components/ui/button";
import { type DisplayCurrency } from "@/lib/currency";

interface CurrencyToggleProps {
  currency: DisplayCurrency;
  onChange: (currency: DisplayCurrency) => void;
  className?: string;
}

export default function CurrencyToggle({ currency, onChange, className }: CurrencyToggleProps) {
  const activeClasses =
    "rounded-md border-transparent bg-amber-400 text-slate-950";
  const inactiveClasses =
    "rounded-md border border-transparent text-slate-200 hover:border-slate-600/70 hover:bg-slate-800/70";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900/70 p-1 ${className ?? ""}`.trim()}
      aria-label="Currency selector"
    >
      <Button
        type="button"
        size="sm"
        variant={currency === "USD" ? "default" : "ghost"}
        onClick={() => onChange("USD")}
        aria-pressed={currency === "USD"}
        className={`min-w-[3.25rem] px-2.5 font-semibold tracking-wide transition-all ${
          currency === "USD" ? activeClasses : inactiveClasses
        }`}
      >
        USD
      </Button>
      <Button
        type="button"
        size="sm"
        variant={currency === "MXN" ? "default" : "ghost"}
        onClick={() => onChange("MXN")}
        aria-pressed={currency === "MXN"}
        className={`min-w-[3.25rem] px-2.5 font-semibold tracking-wide transition-all ${
          currency === "MXN" ? activeClasses : inactiveClasses
        }`}
      >
        MXN
      </Button>
    </div>
  );
}
