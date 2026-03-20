"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDiagnosis } from "@/lib/api";
import type { DiagnosisResponse, GitHubProfileOutput, ManualProfile } from "@/lib/types";
import { DEMO_DIAGNOSIS, DEMO_PROFILE } from "@/data/demo-data";
import { useDemoMode } from "@/lib/use-demo-mode";
import AnimatedSection from "@/components/dashboard/AnimatedSection";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import SalaryDiagnosis from "@/components/dashboard/SalaryDiagnosis";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import SkillRadarChart from "@/components/dashboard/RadarChart";
import OpportunityCards from "@/components/dashboard/OpportunityCards";
import WhatIfSimulator from "@/components/dashboard/WhatIfSimulator";
import SkillHeatmap from "@/components/dashboard/Heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AsyncState from "@/components/ui/async-state";
import InfoTooltip from "@/components/ui/info-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import CurrencyToggle from "@/components/ui/currency-toggle";
import BrandLockup from "@/components/ui/brand-lockup";
import { convertFromUsd, currencyPrefix } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { Copy, Sparkles, Trophy } from "lucide-react";

const DEFAULT_SUGGESTED_SKILLS = ["TypeScript", "AWS", "CI/CD", "Go", "GraphQL", "Terraform"];
const DASHBOARD_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "salary", label: "Salary" },
  { id: "score", label: "Score" },
  { id: "radar", label: "Radar" },
  { id: "opportunities", label: "Opportunities" },
  { id: "what-if", label: "What-if" },
  { id: "trends", label: "Trends" },
  { id: "summary", label: "Summary" },
];

function isGitHubProfile(profile: unknown): profile is GitHubProfileOutput {
  return !!profile && typeof profile === "object" && "username" in profile;
}

const LOCATION_MAP: Record<string, string> = {
  "mexico": "Mexico", "méxico": "Mexico", "cdmx": "Mexico", "mexico city": "Mexico",
  "ciudad de mexico": "Mexico", "guadalajara": "Mexico", "monterrey": "Mexico",
  "colombia": "Colombia", "bogota": "Colombia", "bogotá": "Colombia",
  "medellin": "Colombia", "medellín": "Colombia",
  "argentina": "Argentina", "buenos aires": "Argentina",
  "brazil": "Brazil", "brasil": "Brazil", "são paulo": "Brazil", "sao paulo": "Brazil",
  "chile": "Chile", "santiago": "Chile",
  "peru": "Peru", "lima": "Peru",
  "united states": "United States", "usa": "United States", "us": "United States",
  "san francisco": "United States", "new york": "United States", "seattle": "United States",
  "austin": "United States", "portland": "United States", "los angeles": "United States",
  "chicago": "United States", "boston": "United States", "denver": "United States",
  "canada": "Canada", "toronto": "Canada", "vancouver": "Canada", "montreal": "Canada",
  "united kingdom": "United Kingdom", "uk": "United Kingdom", "london": "United Kingdom",
  "germany": "Germany", "berlin": "Germany", "munich": "Germany", "münchen": "Germany",
  "spain": "Spain", "españa": "Spain", "madrid": "Spain", "barcelona": "Spain",
  "france": "France", "paris": "France",
  "india": "India", "bangalore": "India", "mumbai": "India", "hyderabad": "India",
  "australia": "Australia", "sydney": "Australia", "melbourne": "Australia",
};

function normalizeLocation(raw: string | undefined | null): string {
  if (!raw || raw.trim().length === 0) return "Mexico";
  const lower = raw.toLowerCase().trim();
  for (const [pattern, country] of Object.entries(LOCATION_MAP)) {
    if (lower.includes(pattern)) return country;
  }
  return raw.trim();
}

function toManualProfile(profile: unknown): ManualProfile | null {
  if (!profile || typeof profile !== "object") return null;

  if (isGitHubProfile(profile)) {
    return {
      skills: profile.detected_skills?.slice(0, 20) || [],
      seniority: profile.estimated_seniority || "mid",
      location: normalizeLocation(profile.location),
      years_experience: profile.years_active ?? 3,
      current_role: profile.inferred_role || "Software Engineer",
    };
  }

  const manual = profile as Partial<ManualProfile>;
  if (
    Array.isArray(manual.skills) &&
    typeof manual.seniority === "string" &&
    typeof manual.location === "string" &&
    typeof manual.years_experience === "number" &&
    typeof manual.current_role === "string"
  ) {
    return {
      skills: manual.skills,
      seniority: manual.seniority as ManualProfile["seniority"],
      location: manual.location,
      years_experience: manual.years_experience,
      current_role: manual.current_role,
    };
  }

  return null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ManualProfile>(DEMO_PROFILE);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState<"calling" | "thinking" | "loaded">("calling");
  const [error, setError] = useState<string | null>(null);
  const [showDetailsMobile, setShowDetailsMobile] = useState(false);
  const { currency, setCurrency } = useCurrency();

  const isDemo = useDemoMode();

  useEffect(() => {
    if (isDemo) {
      setProfile(DEMO_PROFILE);
      setDiagnosis(DEMO_DIAGNOSIS);
      setLoadingStage("loaded");
      setIsLoading(false);
      return;
    }

    const loadDiagnosis = async () => {
      setIsLoading(true);
      setLoadingStage("calling");
      setError(null);
      const thinkingTimer = setTimeout(() => setLoadingStage("thinking"), 420);

      try {
        const rawProfile = sessionStorage.getItem("userProfile");
        if (!rawProfile) {
          setProfile(DEMO_PROFILE);
          setDiagnosis(DEMO_DIAGNOSIS);
          return;
        }

        const parsed = JSON.parse(rawProfile);
        const manualProfile = toManualProfile(parsed);

        if (!manualProfile || manualProfile.skills.length === 0) {
          setProfile(DEMO_PROFILE);
          setDiagnosis(DEMO_DIAGNOSIS);
          return;
        }

        setProfile(manualProfile);
        const response = await getDiagnosis(manualProfile);
        setDiagnosis(response);
        sessionStorage.setItem("diagnosisResult", JSON.stringify(response));
        setLoadingStage("loaded");
      } catch {
        setProfile(DEMO_PROFILE);
        setDiagnosis(DEMO_DIAGNOSIS);
        setError("Live diagnosis is temporarily unavailable. Showing demo market data.");
        setLoadingStage("loaded");
      } finally {
        clearTimeout(thinkingTimer);
        setIsLoading(false);
      }
    };

    void loadDiagnosis();
  }, [isDemo]);

  const suggestedSkills = useMemo(() => {
    if (!diagnosis) return DEFAULT_SUGGESTED_SKILLS;

    const fromOpportunities = diagnosis.opportunities.map((item) => item.skill);
    const uniques = Array.from(new Set([...fromOpportunities, ...DEFAULT_SUGGESTED_SKILLS]));
    return uniques.filter((skill) => !profile.skills.includes(skill)).slice(0, 8);
  }, [diagnosis, profile.skills]);

  const handleCopyNarrative = async () => {
    if (!diagnosis?.value_narrative) return;

    try {
      await navigator.clipboard.writeText(diagnosis.value_narrative);
    } catch {
      setError("Unable to copy to clipboard in this browser session.");
    }
  };

  return (
    <main className="pl-bg-main relative min-h-screen overflow-x-hidden p-4 sm:p-6">
      <div className="paylens-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="min-w-0 space-y-8 lg:pr-[16rem]">
        <AnimatedSection index={0} className="scroll-mt-24" >
          <div id="overview" className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <BrandLockup className="w-fit rounded-2xl" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Currency</span>
                <CurrencyToggle currency={currency} onChange={setCurrency} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                Market Diagnosis
                <InfoTooltip text="AI-generated market view of your salary position, role availability, and skill leverage." />
              </p>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Your Market <span className="pl-title-accent">Diagnosis</span>
              </h1>
              <p className="text-sm text-slate-300">Based on 49,000 developers across LATAM market signals.</p>
            </div>
          </div>
        </AnimatedSection>

        {error ? (
          <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {error}
          </p>
        ) : null}

        {isLoading || !diagnosis ? (
          <div className="space-y-5">
            <AsyncState
              state={loadingStage}
              labels={{
                calling: "Calling diagnosis API...",
                thinking: "AI is thinking through your market profile...",
              }}
            />
            <Skeleton className="h-10 w-72 rounded-xl bg-slate-800/80" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className="h-[220px] rounded-xl bg-slate-800/80" />
              <Skeleton className="h-[220px] rounded-xl bg-slate-800/80" />
            </div>
            <Skeleton className="mx-auto h-[180px] max-w-md rounded-xl bg-slate-800/80" />
            <Skeleton className="h-[320px] rounded-xl bg-slate-800/80" />
            <Skeleton className="h-[580px] rounded-xl bg-slate-800/80" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Skeleton className="h-[210px] rounded-xl bg-slate-800/80" />
              <Skeleton className="h-[210px] rounded-xl bg-slate-800/80" />
              <Skeleton className="h-[210px] rounded-xl bg-slate-800/80" />
            </div>
            <Skeleton className="h-[280px] rounded-xl bg-slate-800/80" />
            <Skeleton className="h-[260px] rounded-xl bg-slate-800/80" />
            <Skeleton className="h-[260px] rounded-xl bg-slate-800/80" />
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatedSection index={1}>
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <SummaryStat
                  label="Annual Upside"
                  valueNumber={convertFromUsd(diagnosis.salary_diagnosis.gap_annual, currency)}
                  prefix={currencyPrefix(currency)}
                  tone="emerald"
                />
                <SummaryStat
                  label="Market Position"
                  valueNumber={diagnosis.peer_comparison.overall_percentile}
                  prefix="Top "
                  suffix="%"
                  tone="cyan"
                />
                <SummaryStat
                  label="Potential Roles"
                  valueNumber={diagnosis.salary_diagnosis.potential_job_count}
                  tone="blue"
                />
                <SummaryStat
                  label="Best Next Skill"
                  valueText={diagnosis.salary_diagnosis.key_missing_skill}
                  tone="amber"
                />
              </section>
            </AnimatedSection>

            <AnimatedSection index={2}>
              <section id="salary" className="scroll-mt-24">
                <SalaryDiagnosis diagnosis={diagnosis} currency={currency} />
              </section>
            </AnimatedSection>

            <AnimatedSection index={3}>
              <section id="score" className="scroll-mt-24">
                <ScoreGauge
                  score={diagnosis.market_score.overall}
                  breakdown={diagnosis.market_score.breakdown}
                  percentileLabel={diagnosis.peer_comparison.percentile_label}
                />
              </section>
            </AnimatedSection>

            <div className="md:hidden">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDetailsMobile((value) => !value)}
                className="w-full border-slate-600/80 bg-slate-900/55 text-slate-100 hover:bg-slate-800/70"
              >
                {showDetailsMobile ? "Hide deeper analysis" : "Show deeper analysis"}
              </Button>
            </div>

            <div className={`${showDetailsMobile ? "space-y-5" : "hidden"} md:space-y-5 md:block`}>
              <AnimatedSection index={4}>
                <section id="radar" className="scroll-mt-24">
                  <SkillRadarChart peerComparison={diagnosis.peer_comparison} />
                </section>
              </AnimatedSection>

              <AnimatedSection index={5}>
                <section id="opportunities" className="scroll-mt-24">
                  <OpportunityCards opportunities={diagnosis.opportunities} currency={currency} />
                </section>
              </AnimatedSection>

              <AnimatedSection index={6}>
                <section id="what-if" className="scroll-mt-24">
                  <WhatIfSimulator
                    currentSkills={profile.skills}
                    seniority={profile.seniority}
                    location={profile.location}
                    suggestedSkills={suggestedSkills}
                    currency={currency}
                    isDemo={isDemo}
                  />
                </section>
              </AnimatedSection>

              <AnimatedSection index={7}>
                <section id="trends" className="scroll-mt-24">
                  <SkillHeatmap entries={diagnosis.demand_heatmap} />
                </section>
              </AnimatedSection>

              <AnimatedSection index={8}>
                <Card id="summary" className="relative overflow-hidden rounded-2xl border-amber-400/30 bg-gradient-to-br from-amber-950/35 via-slate-900/85 to-violet-950/35 shadow-[0_24px_70px_rgba(217,119,6,0.2)] scroll-mt-24">
                  <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-amber-400/15 blur-3xl" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5 text-amber-300" />
                      <span className="inline-flex items-center gap-1.5">
                        Market Summary
                        <InfoTooltip text="Concise interpretation of your current standing and primary upside opportunity." />
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="pl-chip-success rounded-md px-2.5 py-1 text-xs font-semibold">
                        <AnimatedCounter
                          value={convertFromUsd(diagnosis.salary_diagnosis.gap_annual, currency)}
                          prefix={currencyPrefix(currency)}
                          duration={1.2}
                        />{" "}
                        annual upside
                      </span>
                      <span className="pl-chip-insight rounded-md px-2.5 py-1 text-xs font-semibold">
                        Top {diagnosis.peer_comparison.overall_percentile}%
                      </span>
                      <span className="rounded-md border border-violet-400/40 bg-violet-500/15 px-2.5 py-1 text-xs font-semibold text-violet-100">
                        <AnimatedCounter value={diagnosis.salary_diagnosis.potential_job_count} duration={1.2} /> roles unlocked
                      </span>
                    </div>
                    <p className="leading-relaxed text-slate-100/95">{diagnosis.market_summary}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection index={9}>
                <Card className="relative overflow-hidden rounded-2xl border-violet-400/30 bg-gradient-to-br from-violet-950/60 via-[#171332] to-slate-950 shadow-[0_24px_75px_rgba(139,92,246,0.22)]">
                  <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-violet-400/15 blur-3xl" />
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between gap-2 text-white">
                      <span className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-violet-200" />
                        <span className="inline-flex items-center gap-1.5">
                          Your Value Statement
                          <InfoTooltip text="Reusable negotiation narrative based on your strongest market signals." />
                        </span>
                      </span>
                      <span className="rounded-md border border-violet-300/35 bg-violet-500/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-100">
                        Final Output
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="border-l-2 border-violet-300/60 pl-4 text-[15px] italic leading-relaxed text-violet-50">
                      &quot;{diagnosis.value_narrative}&quot;
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void handleCopyNarrative()}
                      className="w-full border-violet-300/40 bg-violet-500/10 text-violet-50 hover:bg-violet-500/20 sm:w-auto"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to clipboard
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="button"
                onClick={() => router.push(`/negotiate${isDemo ? "?demo=true" : ""}`)}
                className="amber-edge pl-cta-btn rounded-xl border border-amber-300/45 px-6 py-6 text-base font-semibold text-white shadow-[0_18px_45px_rgba(0,87,240,0.28)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Practice Salary Negotiation
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 z-40 hidden lg:block">
        <div className="relative mx-auto h-full max-w-7xl px-4 sm:px-6">
          <aside className="pointer-events-auto absolute right-4 top-6 max-h-[calc(100vh-3rem)] w-52 overflow-y-auto rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 backdrop-blur sm:right-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-200">Jump To</p>
            <nav className="space-y-1.5">
              {DASHBOARD_SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-md px-2 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800/80 hover:text-white"
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      </div>
    </main>
  );
}

function SummaryStat({
  label,
  valueText,
  valueNumber,
  prefix,
  suffix,
  tone,
}: {
  label: string;
  valueText?: string;
  valueNumber?: number;
  prefix?: string;
  suffix?: string;
  tone: "emerald" | "cyan" | "blue" | "amber";
}) {
  const hints: Record<string, string> = {
    "Annual Upside": "Estimated yearly compensation increase if you close the top skill gap.",
    "Market Position": "Percentile rank versus comparable LATAM developers.",
    "Potential Roles": "Estimated number of matching roles with your projected profile.",
    "Best Next Skill": "Highest-impact skill to improve salary range and role access.",
  };

  const toneClass: Record<"emerald" | "cyan" | "blue" | "amber", string> = {
    emerald: "border-amber-400/35 bg-amber-500/10 text-amber-100",
    cyan: "border-violet-400/35 bg-violet-500/10 text-violet-100",
    blue: "border-violet-400/35 bg-violet-500/10 text-violet-100",
    amber: "border-amber-400/35 bg-amber-500/10 text-amber-100",
  };

  return (
    <Card className={`rounded-xl border ${toneClass[tone]}`}>
      <CardContent className="space-y-1 p-2.5 sm:p-3">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300">
          {label}
          <InfoTooltip text={hints[label] || "Key market metric derived from your profile and diagnosis response."} />
        </p>
        <p className="text-sm font-semibold">
          {typeof valueNumber === "number" ? (
            <AnimatedCounter value={valueNumber} prefix={prefix} suffix={suffix} duration={1.1} />
          ) : (
            valueText
          )}
        </p>
      </CardContent>
    </Card>
  );
}
