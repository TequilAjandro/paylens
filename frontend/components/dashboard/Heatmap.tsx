"use client";

import { motion } from "framer-motion";
import { BarChart3, Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { DiagnosisResponse } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoTooltip from "@/components/ui/info-tooltip";

type HeatmapEntry = DiagnosisResponse["demand_heatmap"][number];

interface HeatmapProps {
  entries: HeatmapEntry[];
}

export default function SkillHeatmap({ entries }: HeatmapProps) {
  const rising = entries.filter((entry) => entry.trend === "rising");
  const stable = entries.filter((entry) => entry.trend === "stable");
  const declining = entries.filter((entry) => entry.trend === "declining");

  return (
    <Card className="glass-panel rounded-xl border-slate-700/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5 text-cyan-300" />
          <span className="inline-flex items-center gap-1.5">
            Skill Demand Trends · LATAM 2025
            <InfoTooltip text="Shows demand direction and growth rate for skills across LATAM market data." />
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {rising.length > 0 ? (
          <TrendRow
            label="Rising"
            icon={<TrendingUp className="h-4 w-4 text-emerald-300" />}
            entries={rising}
            colorClass="border-emerald-400/35 bg-emerald-500/20 text-emerald-200"
          />
        ) : null}

        {stable.length > 0 ? (
          <TrendRow
            label="Stable"
            icon={<Minus className="h-4 w-4 text-yellow-300" />}
            entries={stable}
            colorClass="border-yellow-400/35 bg-yellow-500/20 text-yellow-200"
          />
        ) : null}

        {declining.length > 0 ? (
          <TrendRow
            label="Declining"
            icon={<TrendingDown className="h-4 w-4 text-red-300" />}
            entries={declining}
            colorClass="border-red-400/35 bg-red-500/20 text-red-200"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function TrendRow({
  label,
  icon,
  entries,
  colorClass,
}: {
  label: string;
  icon: React.ReactNode;
  entries: HeatmapEntry[];
  colorClass: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-300">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.skill}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.2 }}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${colorClass}`}
          >
            {entry.skill}
            <span className="ml-1.5 text-xs opacity-80">
              {entry.growth_pct > 0 ? "+" : ""}
              {entry.growth_pct}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
