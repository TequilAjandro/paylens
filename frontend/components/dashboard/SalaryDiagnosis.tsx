"use client";

import { motion } from "framer-motion";
import type { DiagnosisResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";

interface SalaryDiagnosisProps {
  diagnosis: Pick<DiagnosisResponse, "salary_diagnosis">;
}

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SalaryDiagnosis({ diagnosis }: SalaryDiagnosisProps) {
  const sd = diagnosis.salary_diagnosis;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Card className="glass-panel h-full rounded-xl border-slate-700/80">
            <CardContent className="space-y-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                You Today
              </p>
              <p className="text-sm text-slate-400">Based on your current skills and profile.</p>
              <div className="pt-2">
                <div className="text-3xl font-bold text-white sm:text-4xl">
                  <AnimatedCounter value={sd.current_range.min} prefix="$" delay={0.8} />
                  <span className="px-2 text-slate-400">-</span>
                  <AnimatedCounter value={sd.current_range.max} prefix="$" delay={0.8} />
                </div>
                <p className="mt-1 text-sm text-slate-400">USD / year</p>
              </div>
              <p className="text-sm text-slate-400">
                {sd.current_job_count.toLocaleString()} matching positions
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <Card className="glass-panel h-full rounded-xl border-emerald-500/45 shadow-[0_16px_40px_rgba(16,185,129,0.15)]">
            <CardContent className="space-y-3 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                You + 1 Strategic Skill
              </p>
              <p className="text-sm text-slate-300">
                If you also mastered{" "}
                <span className="font-semibold text-emerald-300">{sd.key_missing_skill}</span>
                {sd.secondary_missing_skills.length > 0 ? (
                  <>
                    {" + "}
                    <span className="font-semibold text-emerald-300">
                      {sd.secondary_missing_skills[0]}
                    </span>
                  </>
                ) : null}
                .
              </p>
              <div className="pt-2">
                <div className="text-3xl font-bold text-emerald-300 sm:text-4xl">
                  <AnimatedCounter value={sd.potential_range.min} prefix="$" delay={1.5} />
                  <span className="px-2 text-emerald-200/70">-</span>
                  <AnimatedCounter value={sd.potential_range.max} prefix="$" delay={1.5} />
                </div>
                <p className="mt-1 text-sm text-slate-400">USD / year</p>
              </div>
              <p className="text-sm text-slate-300">
                {sd.potential_job_count.toLocaleString()} positions
                <Badge className="ml-2 border-emerald-400/35 bg-emerald-500/20 text-emerald-200">
                  +{sd.job_count_increase_pct}%
                </Badge>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.5,
          delay: 1.8,
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        className="mx-auto max-w-md"
      >
        <Card className="rounded-xl border-red-500/55 bg-gradient-to-br from-red-950/70 to-[#2b0f17] shadow-[0_18px_42px_rgba(239,68,68,0.25)]">
          <CardContent className="space-y-2 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">
              Left on the Table
            </p>
            <motion.div
              animate={{
                textShadow: [
                  "0 0 0px rgba(248,113,113,0)",
                  "0 0 24px rgba(248,113,113,0.55)",
                  "0 0 0px rgba(248,113,113,0)",
                ],
              }}
              transition={{ duration: 2, repeat: 2, delay: 2.5 }}
            >
              <div className="text-5xl font-extrabold text-red-300">
                <AnimatedCounter value={sd.gap_annual} prefix="$" delay={2} />
              </div>
            </motion.div>
            <p className="text-sm text-red-300">USD / year</p>
            <p className="text-xs text-red-200/80">In 3 years: {formatUSD(sd.gap_3year)}</p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
