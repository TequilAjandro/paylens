"use client";

import { useEffect, useState } from "react";
import type { DiagnosisResponse, GitHubProfileOutput, ManualProfile } from "@/lib/types";
import { getDiagnosis } from "@/lib/api";
import SalaryDiagnosis from "@/components/dashboard/SalaryDiagnosis";
import { Skeleton } from "@/components/ui/skeleton";

const MOCK_DIAGNOSIS: DiagnosisResponse = {
  salary_diagnosis: {
    current_range: { min: 38000, max: 45000, currency: "USD" },
    potential_range: { min: 62000, max: 78000, currency: "USD" },
    gap_annual: 24000,
    gap_3year: 72000,
    current_job_count: 127,
    potential_job_count: 347,
    job_count_increase_pct: 173,
    key_missing_skill: "Kubernetes",
    secondary_missing_skills: ["CI/CD", "AWS"],
  },
  market_score: {
    overall: 73,
    breakdown: {
      skill_demand: 78,
      skill_breadth: 65,
      market_fit: 76,
      growth_potential: 72,
    },
  },
  skills_analysis: [],
  peer_comparison: {
    axes: [],
    user_values: [],
    peer_avg_values: [],
    seniority_group: "mid-level",
    region: "LATAM",
    overall_percentile: 34,
    percentile_label: "Top 34%",
  },
  opportunities: [],
  demand_heatmap: [],
  market_summary: "",
  value_narrative: "",
};

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
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDiagnosis = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const rawProfile = sessionStorage.getItem("userProfile");
        if (!rawProfile) {
          setDiagnosis(MOCK_DIAGNOSIS);
          return;
        }

        const parsed = JSON.parse(rawProfile);
        const manualProfile = toManualProfile(parsed);

        if (!manualProfile || manualProfile.skills.length === 0) {
          setDiagnosis(MOCK_DIAGNOSIS);
          return;
        }

        const response = await getDiagnosis(manualProfile);
        setDiagnosis(response);
      } catch {
        setDiagnosis(MOCK_DIAGNOSIS);
        setError("Live diagnosis unavailable, showing demo data.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDiagnosis();
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-[#09182a] to-[#040b17] p-4 sm:p-6">
      <div className="paylens-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-6xl space-y-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Market Diagnosis</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Salary Gap <span className="text-emerald-300">Reality Check</span>
          </h1>
        </div>

        {error ? (
          <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {error}
          </p>
        ) : null}

        {isLoading || !diagnosis ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Skeleton className="h-[220px] rounded-xl bg-slate-800/80" />
              <Skeleton className="h-[220px] rounded-xl bg-slate-800/80" />
            </div>
            <Skeleton className="mx-auto h-[180px] max-w-md rounded-xl bg-slate-800/80" />
          </div>
        ) : (
          <SalaryDiagnosis diagnosis={diagnosis} />
        )}
      </div>
    </main>
  );
}
