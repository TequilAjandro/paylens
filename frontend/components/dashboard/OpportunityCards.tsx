"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  Clock,
  Minus,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { DiagnosisResponse } from "@/lib/types";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import InfoTooltip from "@/components/ui/info-tooltip";
import { convertFromUsd, currencyPrefix, type DisplayCurrency } from "@/lib/currency";

type Opportunity = DiagnosisResponse["opportunities"][number];

// Inlined type to avoid circular import — matches SkillLearningPlanSchema shape
interface CourseItem {
  name: string;
  platform: string;
  price: string;
  url_hint: string;
  is_company_benefit: boolean;
}

interface CertItem {
  name: string;
  provider: string;
  price: string;
  duration: string;
}

interface FreeItem {
  name: string;
  type: string;
  url_hint: string;
}

interface SkillLearningPlan {
  skill: string;
  company_course: CourseItem | null;
  courses: CourseItem[];
  certifications: CertItem[];
  free_resources: FreeItem[];
  timeline: string;
  first_step: string;
}

interface OpportunityCardsProps {
  opportunities: Opportunity[];
  currency: DisplayCurrency;
  learningPlans?: SkillLearningPlan[];
}

function TrendIcon({ trend }: { trend: Opportunity["demand_trend"] }) {
  if (trend === "rising") {
    return <TrendingUp className="h-4 w-4 text-amber-300" />;
  }
  if (trend === "declining") {
    return <TrendingDown className="h-4 w-4 text-rose-300" />;
  }
  return <Minus className="h-4 w-4 text-amber-300" />;
}

function DifficultyBadge({ difficulty }: { difficulty: Opportunity["difficulty"] }) {
  const colorClasses: Record<Opportunity["difficulty"], string> = {
    low: "border-amber-400/35 bg-amber-500/20 text-amber-200",
    medium: "border-amber-400/35 bg-amber-500/20 text-amber-200",
    high: "border-rose-400/35 bg-rose-500/20 text-rose-100",
  };

  const labels: Record<Opportunity["difficulty"], string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };

  return <Badge className={colorClasses[difficulty]}>{labels[difficulty]}</Badge>;
}

function buildSearchUrl(platform: string, name: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${platform} ${name}`)}`;
}

function LearningPath({ plan }: { plan: SkillLearningPlan }) {
  return (
    <div className="space-y-3 text-sm">
      {plan.company_course && (
        <div className="rounded-lg border border-violet-400/30 bg-violet-500/10 p-3">
          <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-200">
            <Building2 className="h-3.5 w-3.5" />
            Included in your company plan
          </p>
          <a
            href={buildSearchUrl(plan.company_course.platform, plan.company_course.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-violet-300 hover:text-violet-200 hover:underline"
          >
            {plan.company_course.name}
          </a>
          <p className="text-xs text-slate-400">{plan.company_course.platform} · Free</p>
        </div>
      )}

      {plan.courses.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Other options</p>
          {plan.courses.map((c, i) => (
            <div key={i} className="flex items-start justify-between gap-2">
              <div>
                <a
                  href={buildSearchUrl(c.platform, c.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-300 hover:text-violet-200 hover:underline"
                >
                  {c.name}
                </a>
                <p className="text-xs text-slate-400">{c.platform}</p>
              </div>
              <span className="shrink-0 rounded bg-slate-700/60 px-1.5 py-0.5 text-xs text-slate-300">
                {c.price}
              </span>
            </div>
          ))}
        </div>
      )}

      {plan.certifications.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Certification</p>
          {plan.certifications.map((cert, i) => (
            <div key={i} className="flex items-start justify-between gap-2">
              <div>
                <a
                  href={buildSearchUrl(cert.provider, cert.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-violet-300 hover:text-violet-200 hover:underline"
                >
                  <Award className="h-3.5 w-3.5" />
                  {cert.name}
                </a>
                <p className="text-xs text-slate-400">{cert.provider} · {cert.duration}</p>
              </div>
              <span className="shrink-0 rounded bg-slate-700/60 px-1.5 py-0.5 text-xs text-slate-300">
                {cert.price}
              </span>
            </div>
          ))}
        </div>
      )}

      {plan.free_resources.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Free resources</p>
          {plan.free_resources.map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CircleCheck className="h-3.5 w-3.5 text-amber-300" />
              <a
                href={r.url_hint ? `https://${r.url_hint.replace(/^https?:\/\//, "")}` : buildSearchUrl(r.type, r.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200 hover:text-amber-100 hover:underline"
              >
                {r.name}
              </a>
              <span className="text-xs text-slate-500">({r.type})</span>
            </div>
          ))}
        </div>
      )}

      {plan.timeline && (
        <p className="inline-flex items-center gap-1.5 text-slate-300">
          <Clock className="h-3.5 w-3.5 text-violet-300" />
          <span className="font-medium">Timeline:</span> {plan.timeline}
        </p>
      )}

      {plan.first_step && (
        <div className="rounded-lg border border-amber-400/25 bg-amber-500/10 p-2.5">
          <p className="inline-flex items-start gap-1.5 text-slate-200">
            <ChevronRight className="mt-[1px] h-4 w-4 shrink-0 text-amber-200" />
            <span className="font-medium text-amber-200">First step:</span> {plan.first_step}
          </p>
        </div>
      )}
    </div>
  );
}

export default function OpportunityCards({ opportunities, currency, learningPlans = [] }: OpportunityCardsProps) {
  const topOpportunities = opportunities.slice(0, 3);
  const moneyPrefix = currencyPrefix(currency);
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-bold text-white">
        <Zap className="h-5 w-5 text-amber-300" />
        <span className="inline-flex items-center gap-1.5">
          Your Biggest Opportunities
          <InfoTooltip text="Skills with the best combined payoff in salary uplift and role availability." />
        </span>
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {topOpportunities.map((opportunity, index) => {
          const plan = learningPlans.find(
            (p) => p.skill.toLowerCase() === opportunity.skill.toLowerCase()
          );
          const isExpanded = expandedSkill === opportunity.skill;

          return (
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
                        {opportunity.trend_growth_pct > 0 ? "+" : opportunity.trend_growth_pct < 0 ? "-" : ""}
                        <AnimatedCounter
                          value={Math.abs(opportunity.trend_growth_pct)}
                          delay={index * 0.2 + 0.3}
                          duration={0.9}
                        />
                        %
                      </span>
                    </div>
                  </div>

                  <div className="py-1 text-center">
                    <p className="text-3xl font-extrabold text-amber-300">
                      +
                      <AnimatedCounter value={opportunity.unlock_count} delay={index * 0.2 + 0.5} />
                    </p>
                    <p className="text-sm text-slate-300">new roles unlocked</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      +
                      <AnimatedCounter
                        value={convertFromUsd(opportunity.salary_increase_usd, currency)}
                        prefix={moneyPrefix}
                        delay={index * 0.2 + 0.5}
                      />
                    </p>
                    <p className="text-xs text-slate-300">
                      +<AnimatedCounter
                        value={opportunity.salary_increase_pct}
                        delay={index * 0.2 + 0.6}
                        duration={0.9}
                      />
                      % salary increase
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-300">
                      <Clock className="h-3 w-3" />
                      {opportunity.time_to_learn}
                    </div>
                    <DifficultyBadge difficulty={opportunity.difficulty} />
                  </div>

                  {plan && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedSkill(isExpanded ? null : opportunity.skill)}
                        className="w-full border-slate-600/60 bg-slate-800/40 text-slate-200 hover:bg-slate-700/60 hover:text-white"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="mr-1.5 h-3.5 w-3.5" />
                            Hide Learning Path
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                            View Learning Path
                          </>
                        )}
                      </Button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            key="content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="border-t border-slate-700/60 pt-4">
                              <LearningPath plan={plan} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
