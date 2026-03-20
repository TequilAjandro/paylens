"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "@/components/ui/info-tooltip";
import { Progress } from "@/components/ui/progress";

interface ScoreGaugeProps {
  score: number;
  breakdown: Record<string, number>;
  percentileLabel: string;
}

const BREAKDOWN_LABELS: Record<string, string> = {
  skill_demand: "Skill Demand",
  skill_breadth: "Skill Breadth",
  market_fit: "Market Fit",
  growth_potential: "Growth Potential",
};

function getScoreColor(score: number): string {
  if (score >= 70) return "#04A28F";
  if (score >= 40) return "#0057F0";
  return "#334F68";
}

export default function ScoreGauge({ score, breakdown, percentileLabel }: ScoreGaugeProps) {
  const radius = 80;
  const circumference = Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeOffset = circumference * (1 - clampedScore / 100);
  const arcColor = getScoreColor(clampedScore);

  const entries = useMemo(() => Object.entries(breakdown).slice(0, 4), [breakdown]);
  const [animatedBarValues, setAnimatedBarValues] = useState<Record<string, number>>({});

  useEffect(() => {
    setAnimatedBarValues({});
    const timers: number[] = [];

    entries.forEach(([key, value], index) => {
      const targetValue = Math.max(0, Math.min(100, value));
      const timer = window.setTimeout(() => {
        setAnimatedBarValues((prev) => ({ ...prev, [key]: targetValue }));
      }, 850 + index * 120);
      timers.push(timer);
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [entries]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
    >
      <Card className="glass-panel rounded-xl border-slate-700/80">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="h-5 w-5 text-violet-300" />
            <span className="inline-flex items-center gap-1.5">
              Market Readiness Score
              <InfoTooltip text="Composite score (0-100) combining demand, breadth, fit, and growth potential." />
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-8 p-6 md:flex-row md:items-center">
          <div className="relative mx-auto h-36 w-56 shrink-0 md:mx-0">
            <svg viewBox="0 0 200 120" className="h-full w-full">
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#475569"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <motion.path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={arcColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeOffset }}
                transition={{ duration: 2, delay: 1.0, ease: "easeOut" }}
              />
            </svg>

            <div className="absolute inset-0 flex items-end justify-center pb-3">
              <span className="font-mono text-4xl font-bold text-white">
                <AnimatedCounter value={clampedScore} delay={1.0} duration={2} />
              </span>
            </div>
          </div>

          <div className="w-full flex-1 space-y-3">
            <p className="text-sm text-slate-300">{percentileLabel}</p>
            {entries.map(([key, value], index) => {
              const label = BREAKDOWN_LABELS[key] || key;
              const barValue = Math.max(0, Math.min(100, value));

              return (
                <motion.div
                  key={key}
                  className="space-y-1.5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      {label}
                      <InfoTooltip text={`${label} contribution to overall readiness score.`} />
                    </span>
                    <span className="font-mono font-medium text-white">{barValue}</span>
                  </div>
                  <Progress
                    value={animatedBarValues[key] ?? 0}
                    className="h-2 bg-slate-600/40"
                    indicatorClassName="bg-[linear-gradient(90deg,var(--pl-secondary)_0%,var(--pl-primary)_100%)] transition-[width] duration-1000 ease-out"
                  />
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
