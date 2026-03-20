"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { NegotiationReport as NegotiationReportType } from "@/lib/types";
import CurrencyToggle from "@/components/ui/currency-toggle";
import BrandLockup from "@/components/ui/brand-lockup";
import {
  formatCurrencyFromUsd,
  type DisplayCurrency,
} from "@/lib/currency";

interface NegotiationReportProps {
  report: NegotiationReportType;
  currency: DisplayCurrency;
  onCurrencyChange: (currency: DisplayCurrency) => void;
}

export default function NegotiationReport({ report, currency, onCurrencyChange }: NegotiationReportProps) {
  const router = useRouter();
  const ceilingProgress = Math.min(
    100,
    Math.max(0, (report.current_ceiling / Math.max(report.potential_ceiling, 1)) * 100),
  );

  return (
    <main className="pl-bg-main relative min-h-screen overflow-hidden p-4 sm:p-6">
      <div className="paylens-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <BrandLockup className="rounded-2xl" />
          <CurrencyToggle currency={currency} onChange={onCurrencyChange} />
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-2xl border-amber-400/35 bg-gradient-to-br from-amber-950/50 to-slate-900/90 shadow-[0_20px_60px_rgba(217,119,6,0.2)]">
            <CardContent className="space-y-2 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200">Negotiation Result</p>
              <p className="font-mono text-4xl font-bold text-amber-300 sm:text-5xl">
                {formatCurrencyFromUsd(report.final_offer, currency)}
              </p>
              <p className="text-sm text-slate-300">
                Started at {formatCurrencyFromUsd(report.initial_offer, currency)} and negotiated{" "}
                <Badge className="border-amber-400/35 bg-amber-500/20 text-amber-100">
                  +{formatCurrencyFromUsd(report.negotiated_increase, currency)}
                </Badge>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-xl border-slate-700/80 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-5 w-5 text-amber-300" />
                What Worked
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.what_worked.map((item) => (
                <div
                  key={`${item.argument}-${item.impact_usd}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-2"
                >
                  <span className="text-sm text-slate-200">{item.argument}</span>
                  <Badge className="border-amber-400/35 bg-amber-500/20 text-amber-100">
                    +{formatCurrencyFromUsd(item.impact_usd, currency)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="rounded-xl border-slate-700/80 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <XCircle className="h-5 w-5 text-rose-300" />
                What Didn&apos;t Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.what_didnt_work.map((item) => (
                <div
                  key={`${item.argument}-${item.reason}`}
                  className="rounded-lg border border-rose-400/20 bg-rose-500/5 px-3 py-2"
                >
                  <p className="text-sm text-slate-200">{item.argument}</p>
                  <p className="mt-1 text-xs text-rose-200/90">{item.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="rounded-xl border-slate-700/80 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="text-white">Salary Ceiling Gap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Current ceiling</span>
                  <span className="font-mono text-white">{formatCurrencyFromUsd(report.current_ceiling, currency)}</span>
                </div>
                <Progress value={ceilingProgress} className="h-2 bg-slate-800" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Potential ceiling</span>
                  <span className="font-mono text-amber-300">
                    {formatCurrencyFromUsd(report.potential_ceiling, currency)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-100">Skills to close the gap</p>
                {report.skills_to_close_gap.map((item) => (
                  <div key={`${item.skill}-${item.impact_usd}`} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-200">
                      <ArrowRight className="h-3.5 w-3.5 text-amber-300" />
                      {item.skill}
                    </span>
                    <span className="font-mono text-amber-200">
                      +{formatCurrencyFromUsd(item.impact_usd, currency)}/yr
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border-slate-500/45 bg-slate-900/40 text-slate-100 hover:bg-slate-800/60"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
