"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDiagnosis } from "@/lib/api";
import type { DiagnosisResponse, GitHubProfileOutput, ManualProfile } from "@/lib/types";
import { DEMO_DIAGNOSIS, DEMO_PROFILE } from "@/data/demo-data";
import AnimatedSection from "@/components/dashboard/AnimatedSection";
import SalaryDiagnosis from "@/components/dashboard/SalaryDiagnosis";
import ScoreGauge from "@/components/dashboard/ScoreGauge";
import SkillRadarChart from "@/components/dashboard/RadarChart";
import OpportunityCards from "@/components/dashboard/OpportunityCards";
import WhatIfSimulator from "@/components/dashboard/WhatIfSimulator";
import SkillHeatmap from "@/components/dashboard/Heatmap";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Sparkles, Trophy } from "lucide-react";

const DEFAULT_SUGGESTED_SKILLS = ["TypeScript", "AWS", "CI/CD", "Go", "GraphQL", "Terraform"];

function isGitHubProfile(profile: unknown): profile is GitHubProfileOutput {
  return !!profile && typeof profile === "object" && "username" in profile;
}

function toManualProfile(profile: unknown): ManualProfile | null {
  if (!profile || typeof profile !== "object") return null;

  if (isGitHubProfile(profile)) {
    return {
      skills: profile.detected_skills?.slice(0, 20) || [],
      seniority: profile.estimated_seniority || "mid",
      location: "Mexico",
      years_experience: profile.years_active ?? 3,
      current_role: "Software Engineer",
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

  useEffect(() => {
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
  }, []);

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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#09182a] to-[#040b17] p-4 sm:p-6">
      <div className="paylens-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8">
        <AnimatedSection delay={0}>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Market Diagnosis</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Your Market <span className="text-emerald-300">Diagnosis</span>
            </h1>
            <p className="text-sm text-slate-400">Based on 49,000 developers across LATAM market signals.</p>
          </div>
        </AnimatedSection>

        {error ? (
          <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {error}
          </p>
        ) : null}

        {isLoading || !diagnosis ? (
          <div className="space-y-5">
            <p className="text-sm text-slate-300">
              {loadingStage === "calling"
                ? "Calling diagnosis API..."
                : loadingStage === "thinking"
                  ? "AI is thinking through your market profile..."
                  : "Loaded"}
            </p>
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
            <AnimatedSection delay={0.3}>
              <SalaryDiagnosis diagnosis={diagnosis} />
            </AnimatedSection>

            <AnimatedSection delay={1.5}>
              <ScoreGauge
                score={diagnosis.market_score.overall}
                breakdown={diagnosis.market_score.breakdown}
                percentileLabel={diagnosis.peer_comparison.percentile_label}
              />
            </AnimatedSection>

            <AnimatedSection delay={2.5}>
              <SkillRadarChart peerComparison={diagnosis.peer_comparison} />
            </AnimatedSection>

            <AnimatedSection delay={3.5}>
              <OpportunityCards opportunities={diagnosis.opportunities} />
            </AnimatedSection>

            <AnimatedSection delay={4.5}>
              <WhatIfSimulator
                currentSkills={profile.skills}
                seniority={profile.seniority}
                location={profile.location}
                suggestedSkills={suggestedSkills}
              />
            </AnimatedSection>

            <AnimatedSection delay={5.0}>
              <SkillHeatmap entries={diagnosis.demand_heatmap} />
            </AnimatedSection>

            <AnimatedSection delay={5.5}>
              <Card className="relative overflow-hidden rounded-2xl border-emerald-400/30 bg-gradient-to-br from-emerald-950/50 via-slate-900/85 to-cyan-950/35 shadow-[0_24px_70px_rgba(16,185,129,0.22)]">
                <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-emerald-400/15 blur-3xl" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-emerald-300" />
                    Market Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-md border border-emerald-400/40 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-100">
                      ${diagnosis.salary_diagnosis.gap_annual.toLocaleString()} annual upside
                    </span>
                    <span className="rounded-md border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 text-xs font-semibold text-cyan-100">
                      Top {diagnosis.peer_comparison.overall_percentile}%
                    </span>
                    <span className="rounded-md border border-blue-400/40 bg-blue-500/15 px-2.5 py-1 text-xs font-semibold text-blue-100">
                      {diagnosis.salary_diagnosis.potential_job_count} roles unlocked
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-100/95">{diagnosis.market_summary}</p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={6.0}>
              <Card className="relative overflow-hidden rounded-2xl border-blue-400/30 bg-gradient-to-br from-blue-950/60 via-[#0a1730] to-slate-950 shadow-[0_24px_75px_rgba(59,130,246,0.2)]">
                <div className="pointer-events-none absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-blue-400/15 blur-3xl" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between gap-2 text-white">
                    <span className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-200" />
                      Your Value Statement
                    </span>
                    <span className="rounded-md border border-blue-300/35 bg-blue-500/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-100">
                      Final Output
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="border-l-2 border-blue-300/60 pl-4 text-[15px] italic leading-relaxed text-blue-50">
                    &quot;{diagnosis.value_narrative}&quot;
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleCopyNarrative()}
                    className="w-full border-blue-300/40 bg-blue-500/10 text-blue-50 hover:bg-blue-500/20 sm:w-auto"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to clipboard
                  </Button>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={6.5}>
              <div className="flex justify-center pt-2">
                <Button
                  type="button"
                  onClick={() => router.push("/negotiate")}
                  className="rounded-xl bg-emerald-600 px-6 py-6 text-base font-semibold text-white shadow-[0_18px_45px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500"
                >
                  Practice Salary Negotiation
                </Button>
              </div>
            </AnimatedSection>
          </div>
        )}
      </div>
    </main>
  );
}
