"use client";

import { motion } from "framer-motion";
import { Building2, Globe2, Landmark, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CurrencyToggle from "@/components/ui/currency-toggle";
import {
  formatCurrencyFromUsd,
  type DisplayCurrency,
} from "@/lib/currency";

export type NegotiationCompany = {
  id: "mercadolibre" | "globant" | "nubank" | "rappi";
  name: string;
  role: string;
  description: string;
  salaryRangeUsd: { min: number; max: number };
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
};

const COMPANIES: NegotiationCompany[] = [
  {
    id: "mercadolibre",
    name: "MercadoLibre",
    role: "Senior Backend Engineer",
    description: "High-scale backend, distributed systems, latency-sensitive traffic.",
    salaryRangeUsd: { min: 40000, max: 85000 },
    icon: Building2,
    accentClass: "from-amber-500/25 to-amber-500/5 border-amber-400/35",
  },
  {
    id: "globant",
    name: "Globant",
    role: "DevOps Engineer",
    description: "Client-facing platform reliability across global product teams.",
    salaryRangeUsd: { min: 35000, max: 70000 },
    icon: Globe2,
    accentClass: "from-violet-500/25 to-violet-500/5 border-violet-400/35",
  },
  {
    id: "nubank",
    name: "Nubank",
    role: "Python Engineer",
    description: "Fintech quality bar, secure architecture, reliability at scale.",
    salaryRangeUsd: { min: 50000, max: 95000 },
    icon: Landmark,
    accentClass: "from-violet-500/25 to-violet-500/5 border-violet-400/35",
  },
  {
    id: "rappi",
    name: "Rappi",
    role: "Full Stack Developer",
    description: "Fast-paced product delivery with marketplace-scale backend flows.",
    salaryRangeUsd: { min: 35000, max: 65000 },
    icon: Rocket,
    accentClass: "from-rose-500/25 to-rose-500/5 border-rose-400/35",
  },
];

interface CompanySelectorProps {
  onSelect: (company: NegotiationCompany) => void;
  currency: DisplayCurrency;
  onCurrencyChange: (currency: DisplayCurrency) => void;
}

export default function CompanySelector({ onSelect, currency, onCurrencyChange }: CompanySelectorProps) {
  return (
    <main className="pl-bg-main relative min-h-screen overflow-hidden p-5 sm:p-7">
      <div className="paylens-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Practice Salary Negotiation</h1>
          <p className="mx-auto max-w-2xl text-slate-300">
            Choose a company and run a realistic compensation conversation with an AI hiring manager.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Currency</span>
            <CurrencyToggle currency={currency} onChange={onCurrencyChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {COMPANIES.map((company, index) => {
            const Icon = company.icon;
            return (
              <motion.button
                key={company.id}
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
                onClick={() => onSelect(company)}
                className="text-left"
              >
                <Card
                  className={`h-full overflow-hidden rounded-xl border bg-gradient-to-br ${company.accentClass} from-35% to-100% transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/55 hover:shadow-[0_16px_42px_rgba(245,158,11,0.18)]`}
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h2 className="text-lg font-bold text-white">{company.name}</h2>
                        <p className="text-sm font-medium text-amber-100">{company.role}</p>
                      </div>
                      <span className="rounded-lg border border-white/15 bg-white/5 p-2">
                        <Icon className="h-5 w-5 text-white" />
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-300">{company.description}</p>
                    <Badge className="border-slate-500/45 bg-slate-950/45 text-slate-100">
                      {formatCurrencyFromUsd(company.salaryRangeUsd.min, currency)} -{" "}
                      {formatCurrencyFromUsd(company.salaryRangeUsd.max, currency)}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
