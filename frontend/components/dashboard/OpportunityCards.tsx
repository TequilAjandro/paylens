"use client";

import { motion } from "framer-motion";
import { Clock, Minus, TrendingDown, TrendingUp, Zap } from "lucide-react";
import type { DiagnosisResponse } from "@/lib/types";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import InfoTooltip from "@/components/ui/info-tooltip";

type Opportunity = DiagnosisResponse["opportunities"][number];

interface OpportunityCardsProps {
  opportunities: Opportunity[];
}

function TrendIcon({ trend }: { trend: Opportunity["demand_trend"] }) {
  if (trend === "rising") {
    return <TrendingUp className="h-4 w-4 text-emerald-300" />;
  }
  if (trend === "declining") {
    return <TrendingDown className="h-4 w-4 text-rose-300" />;
  }
  return <Minus className="h-4 w-4 text-yellow-300" />;
}

function DifficultyBadge({ difficulty }: { difficulty: Opportunity["difficulty"] }) {
  const colorClasses: Record<Opportunity["difficulty"], string> = {
    low: "border-emerald-400/35 bg-emerald-500/20 text-emerald-200",
    medium: "border-yellow-400/35 bg-yellow-500/20 text-yellow-200",
    high: "border-rose-400/35 bg-rose-500/20 text-rose-100",
  };

  const labels: Record<Opportunity["difficulty"], string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return <Badge className={colorClasses[difficulty]}>{labels[difficulty]}</Badge>;
}

export default function OpportunityCards({ opportunities }: OpportunityCardsProps) {
  const topOpportunities = opportunities.slice(0, 3);

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-bold text-white">
        <Zap className="h-5 w-5 text-yellow-300" />
        <span className="inline-flex items-center gap-1.5">
          Your Biggest Opportunities
          <InfoTooltip text="Skills with the best combined payoff in salary uplift and role availability." />
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topOpportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.skill}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5, ease: "easeOut" }}
          >
            <Card className="glass-panel h-full rounded-xl border-slate-700/80 transition-colors hover:border-amber-400/45">
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{opportunity.skill}</h3>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={opportunity.demand_trend} />
                    <span className="text-xs text-slate-300">
                      {opportunity.trend_growth_pct > 0 ? "+" : ""}
                      {opportunity.trend_growth_pct}%
                    </span>
                  </div>
                </div>

                <div className="py-1 text-center">
                  <p className="text-3xl font-extrabold text-emerald-300">
                    +
                    <AnimatedCounter value={opportunity.unlock_count} delay={index * 0.2 + 0.5} />
                  </p>
                  <p className="text-sm text-slate-300">new roles unlocked</p>
                </div>

                <div className="text-center">
                  <p className="text-xl font-bold text-white">
                    +
                    <AnimatedCounter
                      value={opportunity.salary_increase_usd}
                      prefix="$"
                      delay={index * 0.2 + 0.5}
                    />
                  </p>
                  <p className="text-xs text-slate-300">
                    +{opportunity.salary_increase_pct}% salary increase
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                  <div className="flex items-center gap-1 text-xs text-slate-300">
                    <Clock className="h-3 w-3" />
                    {opportunity.time_to_learn}
                  </div>
                  <DifficultyBadge difficulty={opportunity.difficulty} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
