"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Lightbulb } from "lucide-react";
import type { WhatIfResponse } from "@/lib/types";
import { getWhatIf } from "@/lib/api";
import AsyncState from "@/components/ui/async-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "@/components/ui/info-tooltip";

interface WhatIfSimulatorProps {
  currentSkills: string[];
  seniority: string;
  location: string;
  suggestedSkills: string[];
}

const MOCK_WHAT_IF: WhatIfResponse = {
  new_score: 79,
  score_change: "+6",
  new_salary_range: { min: 52000, max: 65000, currency: "USD" },
  salary_change_usd: 14000,
  new_job_count: 174,
  job_count_change: "+47",
  new_percentile: 19,
  percentile_change: "+15",
  insight:
    "Adding Kubernetes moves you from top 34% to top 19% of mid-level LATAM developers and unlocks 47 new roles.",
};

export default function WhatIfSimulator({
  currentSkills,
  seniority,
  location,
  suggestedSkills,
}: WhatIfSimulatorProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "calling" | "thinking" | "loaded" | "error">("idle");

  const handleToggle = async (skill: string) => {
    const nextSelection = selectedSkills.includes(skill)
      ? selectedSkills.filter((item) => item !== skill)
      : [...selectedSkills, skill];

    setSelectedSkills(nextSelection);

    if (nextSelection.length === 0) {
      setResult(null);
      setStatus("idle");
      return;
    }

    setIsLoading(true);
    setStatus("calling");
    const thinkingTimer = setTimeout(() => setStatus("thinking"), 350);
    try {
      const response = await getWhatIf({
        current_skills: currentSkills,
        hypothetical_add: nextSelection,
        hypothetical_remove: [],
        seniority,
        location,
      });
      setResult(response);
      setStatus("loaded");
    } catch {
      setResult(MOCK_WHAT_IF);
      setStatus("error");
    } finally {
      clearTimeout(thinkingTimer);
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-panel rounded-xl border-slate-700/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Lightbulb className="h-5 w-5 text-yellow-300" />
          <span className="inline-flex items-center gap-1.5">
            What If You Learned...?
            <InfoTooltip text="Simulates how adding selected skills could change your score, salary, and role access." />
          </span>
        </CardTitle>
        <p className="text-sm text-slate-300">Toggle skills to see how your market position changes.</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => {
            const active = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => void handleToggle(skill)}
                className={
                  active
                    ? "inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-lg shadow-amber-500/25 transition-all"
                    : "inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-700"
                }
              >
                {active ? <Check className="h-3.5 w-3.5" /> : "+"}
                {skill}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key={selectedSkills.join(",")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
            >
              <ResultCard label="New Score" value={result.new_score} change={result.score_change} />
              <ResultCard
                label="Salary Change"
                value={`+$${result.salary_change_usd.toLocaleString()}`}
                change=""
              />
              <ResultCard label="New Jobs" value={result.job_count_change} change="" />
              <ResultCard
                label="Percentile"
                value={`Top ${result.new_percentile}%`}
                change={result.percentile_change}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {result?.insight ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-lg border border-violet-500/35 bg-violet-950/30 p-3 text-sm text-violet-100"
          >
            {result.insight}
          </motion.p>
        ) : null}

        <AsyncState
          state={status}
          labels={{
            calling: "Calling what-if endpoint...",
            thinking: "Recalculating with selected skills...",
            loaded: "What-if scenario updated",
            error: "Using fallback simulation data",
          }}
          className={isLoading ? "animate-pulse" : ""}
        />
      </CardContent>
    </Card>
  );
}

function ResultCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string | number;
  change: string;
}) {
  return (
    <div className="rounded-lg border border-slate-700/70 bg-slate-900/60 p-3 text-center">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="font-mono text-xl font-bold text-white">{value}</p>
      {change ? <p className="text-xs text-amber-300">{change}</p> : null}
    </div>
  );
}
