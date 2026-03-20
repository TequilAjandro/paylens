import type { ManualProfile } from "@/lib/types";

type Trend = "rising" | "stable" | "declining";
type HeatColor = "green" | "yellow" | "red";
type Difficulty = "low" | "medium" | "high";

export type WhatIfPayload = {
  current_skills: string[];
  hypothetical_add: string[];
  hypothetical_remove: string[];
  seniority: string;
  location: string;
};

export type NegotiatePayload = {
  company: "mercadolibre" | "globant" | "nubank" | "rappi";
  role: string;
  user_profile: Record<string, unknown>;
  conversation_history: Array<{ role: "user" | "assistant"; content: string }>;
  user_message: string;
};

const SENIORITY_MULTIPLIER: Record<string, number> = {
  junior: 0.72,
  mid: 1,
  senior: 1.38,
  staff: 1.75,
};

const COMPANY_BASE_OFFER = {
  mercadolibre: 48000,
  globant: 42000,
  nubank: 58000,
  rappi: 39000,
};

function normalizeSkill(value: string): string {
  return value.trim().toLowerCase();
}

export function buildGitHubProfile(usernameInput: string) {
  const username = usernameInput
    .replace(/^https?:\/\/github\.com\//i, "")
    .split("/")
    .filter(Boolean)[0] || "developer";

  return {
    username,
    detected_skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "React"],
    primary_languages: [
      { language: "Python", percentage: 62, repos_count: 9 },
      { language: "TypeScript", percentage: 23, repos_count: 5 },
      { language: "SQL", percentage: 15, repos_count: 4 },
    ],
    estimated_seniority: "mid" as const,
    years_active: 4,
    total_repos: 18,
    total_commits_last_year: 512,
    notable_patterns: [
      "Consistent backend API development",
      "Rising cloud-native adoption",
      "Frequent deployment automation commits",
    ],
    profile_summary: `${username} shows solid backend and API engineering experience with clear platform growth.`,
  };
}

export function buildDiagnosis(profile: ManualProfile) {
  const normalizedSkills = new Set(profile.skills.map(normalizeSkill));
  const skillCount = normalizedSkills.size;
  const seniorityMult = SENIORITY_MULTIPLIER[profile.seniority] ?? 1;

  const skillDemand = 50 + Math.min(35, skillCount * 4);
  const skillBreadth = 45 + Math.min(35, skillCount * 3);
  const marketFit = 52 + Math.min(28, Math.floor(profile.years_experience * 3));
  const growthPotential = 48 + Math.min(30, Math.floor(skillCount * 2.8));
  const overallScore = Math.floor((skillDemand + skillBreadth + marketFit + growthPotential) / 4);

  const currentMin = Math.floor(32000 * seniorityMult + skillCount * 1200);
  const currentMax = Math.floor(currentMin * 1.2);
  const potentialMin = Math.floor(currentMin * 1.42);
  const potentialMax = Math.floor(currentMax * 1.55);

  const currentJobs = 85 + skillCount * 9 + Math.floor(profile.years_experience * 4);
  const potentialJobs = Math.floor(currentJobs * 1.75);
  const jobGrowth = Math.floor(((potentialJobs - currentJobs) / Math.max(currentJobs, 1)) * 100);
  const gapAnnual = potentialMin - currentMin;

  const keyMissingSkill = normalizedSkills.has("kubernetes") ? "AWS" : "Kubernetes";
  const secondaryMissingSkills = ["AWS", "CI/CD", "Terraform"]
    .filter((item) => !normalizedSkills.has(item.toLowerCase()))
    .slice(0, 2);

  const opportunitiesPool: Array<[string, number, number, number, Trend, number, Difficulty, string]> = [
    ["Kubernetes", 48, 30, 12000, "rising", 140, "medium", "2-3 months"],
    ["AWS", 38, 24, 9500, "rising", 22, "medium", "3-4 months"],
    ["TypeScript", 27, 14, 6000, "rising", 33, "low", "1-2 months"],
  ];

  let opportunities = opportunitiesPool
    .filter(([skill]) => !normalizedSkills.has(skill.toLowerCase()))
    .slice(0, 3)
    .map(([skill, unlockCount, salaryIncreasePct, salaryIncreaseUsd, demandTrend, trendGrowthPct, difficulty, ttl]) => ({
      skill,
      unlock_count: unlockCount,
      salary_increase_pct: salaryIncreasePct,
      salary_increase_usd: salaryIncreaseUsd,
      demand_trend: demandTrend,
      trend_growth_pct: trendGrowthPct,
      difficulty,
      time_to_learn: ttl,
    }));

  if (opportunities.length === 0) {
    opportunities = [
      {
        skill: "Platform Architecture",
        unlock_count: 21,
        salary_increase_pct: 10,
        salary_increase_usd: 4800,
        demand_trend: "stable",
        trend_growth_pct: 8,
        difficulty: "medium",
        time_to_learn: "2 months",
      },
    ];
  }

  const demandHeatmap: Array<{ skill: string; trend: Trend; growth_pct: number; color: HeatColor }> = [
    { skill: "Kubernetes", trend: "rising", growth_pct: 140, color: "green" },
    { skill: "TypeScript", trend: "rising", growth_pct: 33, color: "green" },
    { skill: "CI/CD", trend: "rising", growth_pct: 28, color: "green" },
    { skill: "Python", trend: "stable", growth_pct: 6, color: "yellow" },
    { skill: "React", trend: "stable", growth_pct: 5, color: "yellow" },
    { skill: "SQL", trend: "stable", growth_pct: 4, color: "yellow" },
    { skill: "Angular", trend: "declining", growth_pct: -8, color: "red" },
    { skill: "jQuery", trend: "declining", growth_pct: -15, color: "red" },
  ];

  const skillsAnalysis = (Array.from(normalizedSkills).slice(0, 5).length
    ? Array.from(normalizedSkills).slice(0, 5)
    : ["python", "sql", "docker"]
  ).map((skill, index) => ({
    skill_name: skill.charAt(0).toUpperCase() + skill.slice(1),
    current_level: "intermediate",
    market_demand: (index < 2 ? "rising" : "stable") as Trend,
    percentile_rank: Math.min(92, 40 + index * 7 + Math.floor(profile.years_experience * 2)),
    salary_impact_usd: 3500 + index * 900,
    trend_direction: (index < 2 ? "rising" : "stable") as Trend,
    trend_growth_pct: 10 + index * 3,
  }));

  const percentile = Math.max(10, Math.min(92, 100 - overallScore));

  return {
    salary_diagnosis: {
      current_range: { min: currentMin, max: currentMax, currency: "USD" },
      potential_range: { min: potentialMin, max: potentialMax, currency: "USD" },
      gap_annual: gapAnnual,
      gap_3year: gapAnnual * 3,
      current_job_count: currentJobs,
      potential_job_count: potentialJobs,
      job_count_increase_pct: jobGrowth,
      key_missing_skill: keyMissingSkill,
      secondary_missing_skills: secondaryMissingSkills,
    },
    market_score: {
      overall: Math.max(0, Math.min(100, overallScore)),
      breakdown: {
        skill_demand: skillDemand,
        skill_breadth: skillBreadth,
        market_fit: marketFit,
        growth_potential: growthPotential,
      },
    },
    skills_analysis: skillsAnalysis,
    peer_comparison: {
      axes: ["Frontend", "Backend", "DevOps", "Data", "AI/ML", "Soft Skills"],
      user_values: [4, 8, 5, 6, 3, 7],
      peer_avg_values: [6, 7, 6, 5, 4, 6],
      seniority_group: `${profile.seniority}-level`,
      region: profile.location,
      overall_percentile: percentile,
      percentile_label: `Top ${percentile}% of ${profile.seniority}-level LATAM developers`,
    },
    opportunities,
    demand_heatmap: demandHeatmap,
    market_summary: `Your ${profile.current_role} profile in ${profile.location} is currently priced around $${currentMin.toLocaleString()}-$${currentMax.toLocaleString()} per year. Closing your cloud-native skill gap can move your range to $${potentialMin.toLocaleString()}-$${potentialMax.toLocaleString()} and expand your opportunity set by ${jobGrowth}%.`,
    value_narrative: `I deliver high-impact ${profile.current_role.toLowerCase()} outcomes with ${profile.skills.slice(0, 4).join(", ")}. My track record in shipping reliable systems and improving engineering velocity positions me to drive stronger platform outcomes at greater scope.`,
  };
}

export function buildWhatIf(payload: WhatIfPayload) {
  const selected = payload.hypothetical_add.length;
  const strongest = payload.hypothetical_add[0] || "Kubernetes";
  const baseScore = 72 + Math.min(14, selected * 4);
  const salaryLift = 4500 * Math.max(selected, 1);
  const jobsLift = 18 * Math.max(selected, 1);
  const percentile = Math.max(8, 34 - selected * 5);

  return {
    new_score: baseScore,
    score_change: `+${baseScore - 72}`,
    new_salary_range: { min: 52000 + salaryLift, max: 66000 + salaryLift, currency: "USD" },
    salary_change_usd: salaryLift,
    new_job_count: 130 + jobsLift,
    job_count_change: `+${jobsLift}`,
    new_percentile: percentile,
    percentile_change: `+${selected * 5}`,
    insight: `Adding ${strongest} improves your market score, raises compensation potential, and broadens role access in ${payload.location}.`,
  };
}

export function buildNegotiationTurn(payload: NegotiatePayload) {
  const baseOffer = COMPANY_BASE_OFFER[payload.company] ?? 42000;
  const turnNumber =
    payload.conversation_history.filter((item) => item.role === "user").length +
    (payload.user_message === "START_NEGOTIATION" ? 0 : 1);

  if (payload.user_message === "START_NEGOTIATION") {
    return {
      ai_response: `Thanks for joining. For ${payload.role}, our opening offer is $${baseOffer.toLocaleString()} USD/year. Walk me through the outcomes you can deliver that justify moving this offer.`,
      current_offer: baseOffer,
      turn_number: 1,
      negotiation_complete: false,
      argument_impact: null,
    };
  }

  const impact = Math.min(3500, 800 + Math.max(0, payload.user_message.split(/\s+/).length - 6) * 90);
  const currentOffer = baseOffer + Math.max(700, turnNumber * 450) + impact;
  const complete =
    turnNumber >= 5 || ["final", "close", "accept"].some((word) => payload.user_message.toLowerCase().includes(word));

  return {
    ai_response: `I see your point on measurable impact and delivery scope. I can improve the offer to $${currentOffer.toLocaleString()} if we align on expectations for this role.`,
    current_offer: currentOffer,
    turn_number: turnNumber,
    negotiation_complete: complete,
    argument_impact: {
      argument: payload.user_message.slice(0, 120),
      impact_usd: impact,
      accepted: true,
    },
  };
}

export function buildNegotiationReport(payload: {
  final_offer: number;
  initial_offer: number;
}) {
  const increase = Math.max(0, payload.final_offer - payload.initial_offer);

  return {
    final_offer: payload.final_offer,
    initial_offer: payload.initial_offer,
    negotiated_increase: increase,
    what_worked: [
      { argument: "Quantified platform impact with metrics", impact_usd: Math.max(1200, Math.floor(increase * 0.45)) },
      {
        argument: "Clear ownership scope and reliability outcomes",
        impact_usd: Math.max(900, Math.floor(increase * 0.35)),
      },
    ],
    what_didnt_work: [
      {
        argument: "Generic market comparison without context",
        reason: "The argument lacked role-specific evidence for this company.",
      },
    ],
    current_ceiling: payload.final_offer + 3000,
    potential_ceiling: payload.final_offer + 22000,
    skills_to_close_gap: [
      { skill: "Kubernetes", impact_usd: 12000 },
      { skill: "CI/CD", impact_usd: 7000 },
      { skill: "Observability", impact_usd: 5000 },
    ],
  };
}
