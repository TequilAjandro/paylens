"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { NegotiationReport as NegotiationReportType } from "@/lib/types";

interface NegotiationReportProps {
  report: NegotiationReportType;
}

export default function NegotiationReport({ report }: NegotiationReportProps) {
  const router = useRouter();
  const ceilingProgress = Math.min(
    100,
    Math.max(0, (report.current_ceiling / Math.max(report.potential_ceiling, 1)) * 100),
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#0a1426] to-[#06111f] p-4 sm:p-6">
      <div className="paylens-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-2xl border-emerald-400/35 bg-gradient-to-br from-emerald-950/50 to-slate-900/90 shadow-[0_20px_60px_rgba(16,185,129,0.2)]">
            <CardContent className="space-y-2 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200">Negotiation Result</p>
              <p className="font-mono text-4xl font-bold text-emerald-300 sm:text-5xl">
                ${report.final_offer.toLocaleString()}
              </p>
              <p className="text-sm text-slate-300">
                Started at ${report.initial_offer.toLocaleString()} and negotiated{" "}
                <Badge className="border-emerald-400/35 bg-emerald-500/20 text-emerald-100">
                  +${report.negotiated_increase.toLocaleString()}
                </Badge>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="rounded-xl border-slate-700/80 bg-slate-900/70">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                What Worked
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {report.what_worked.map((item) => (
                <div
                  key={`${item.argument}-${item.impact_usd}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-emerald-400/20 bg-emerald-500/5 px-3 py-2"
                >
                  <span className="text-sm text-slate-200">{item.argument}</span>
                  <Badge className="border-emerald-400/35 bg-emerald-500/20 text-emerald-100">
                    +${item.impact_usd.toLocaleString()}
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
                  <span className="text-slate-400">Current ceiling</span>
                  <span className="font-mono text-white">${report.current_ceiling.toLocaleString()}</span>
                </div>
                <Progress value={ceilingProgress} className="h-2 bg-slate-800" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Potential ceiling</span>
                  <span className="font-mono text-emerald-300">${report.potential_ceiling.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-100">Skills to close the gap</p>
                {report.skills_to_close_gap.map((item) => (
                  <div key={`${item.skill}-${item.impact_usd}`} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-200">
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-300" />
                      {item.skill}
                    </span>
                    <span className="font-mono text-emerald-200">+${item.impact_usd.toLocaleString()}/yr</span>
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
