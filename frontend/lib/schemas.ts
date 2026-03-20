import { z } from "zod";

const SeniorityEnum = z.enum(["junior", "mid", "senior", "staff"]);
const TrendEnum = z.enum(["rising", "stable", "declining"]);
const ColorEnum = z.enum(["green", "yellow", "red"]);
const CompanyEnum = z.enum(["mercadolibre", "globant", "nubank", "rappi"]);

export const ManualProfileSchema = z.object({
  skills: z.array(z.string()).min(1).max(20),
  seniority: SeniorityEnum,
  location: z.string().min(2).max(50),
  years_experience: z.number().int().min(0).max(50),
  current_role: z.string().min(2).max(100),
});

export const GitHubProfileInputSchema = z.object({
  github_url: z.string().url().optional(),
  github_username: z.string().min(1).optional(),
});

export const GitHubProfileRequestSchema = GitHubProfileInputSchema.refine(
  (value) => Boolean(value.github_url || value.github_username),
  {
    message: "github_username or github_url is required",
    path: ["github_username"],
  },
);

export const ConversationMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

export const GitHubProfileOutputSchema = z.object({
  username: z.string(),
  detected_skills: z.array(z.string()),
  primary_languages: z.array(
    z.object({
      language: z.string(),
      percentage: z.number(),
      repos_count: z.number(),
    }),
  ),
  estimated_seniority: SeniorityEnum,
  years_active: z.number(),
  total_repos: z.number(),
  total_commits_last_year: z.number(),
  notable_patterns: z.array(z.string()),
  profile_summary: z.string(),
});

const SalaryRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  currency: z.string().default("USD"),
});

export const DiagnosisResponseSchema = z.object({
  salary_diagnosis: z.object({
    current_range: SalaryRangeSchema,
    potential_range: SalaryRangeSchema,
    gap_annual: z.number(),
    gap_3year: z.number(),
    current_job_count: z.number(),
    potential_job_count: z.number(),
    job_count_increase_pct: z.number(),
    key_missing_skill: z.string(),
    secondary_missing_skills: z.array(z.string()),
  }),
  market_score: z.object({
    overall: z.number().min(0).max(100),
    breakdown: z.record(z.string(), z.number()),
  }),
  skills_analysis: z.array(
    z.object({
      skill_name: z.string(),
      current_level: z.string(),
      market_demand: TrendEnum,
      percentile_rank: z.number(),
      salary_impact_usd: z.number(),
      trend_direction: TrendEnum,
      trend_growth_pct: z.number(),
    }),
  ),
  peer_comparison: z.object({
    axes: z.array(z.string()),
    user_values: z.array(z.number()),
    peer_avg_values: z.array(z.number()),
    seniority_group: z.string(),
    region: z.string(),
    overall_percentile: z.number(),
    percentile_label: z.string(),
  }),
  opportunities: z.array(
    z.object({
      skill: z.string(),
      unlock_count: z.number(),
      salary_increase_pct: z.number(),
      salary_increase_usd: z.number(),
      demand_trend: TrendEnum,
      trend_growth_pct: z.number(),
      difficulty: z.enum(["low", "medium", "high"]),
      time_to_learn: z.string(),
    }),
  ),
  demand_heatmap: z.array(
    z.object({
      skill: z.string(),
      trend: TrendEnum,
      growth_pct: z.number(),
      color: ColorEnum,
    }),
  ),
  market_summary: z.string(),
  value_narrative: z.string(),
});

export const WhatIfRequestSchema = z.object({
  current_skills: z.array(z.string()).max(30),
  hypothetical_add: z.array(z.string()).max(10),
  hypothetical_remove: z.array(z.string()).max(10),
  seniority: SeniorityEnum,
  location: z.string().min(2).max(50),
});

export const WhatIfResponseSchema = z.object({
  new_score: z.number(),
  score_change: z.string(),
  new_salary_range: SalaryRangeSchema,
  salary_change_usd: z.number(),
  new_job_count: z.number(),
  job_count_change: z.string(),
  new_percentile: z.number(),
  percentile_change: z.string(),
  insight: z.string(),
});

export const NegotiateRequestSchema = z.object({
  company: CompanyEnum,
  role: z.string().min(2).max(120),
  user_profile: z.record(z.string(), z.unknown()),
  conversation_history: z.array(ConversationMessageSchema).max(30),
  user_message: z.string().min(1).max(2000),
});

export const NegotiateResponseSchema = z.object({
  ai_response: z.string(),
  current_offer: z.number(),
  turn_number: z.number(),
  negotiation_complete: z.boolean(),
  argument_impact: z
    .object({
      argument: z.string(),
      impact_usd: z.number(),
      accepted: z.boolean(),
    })
    .nullable(),
});

export const NegotiationReportSchema = z.object({
  final_offer: z.number(),
  initial_offer: z.number(),
  negotiated_increase: z.number(),
  what_worked: z.array(
    z.object({
      argument: z.string(),
      impact_usd: z.number(),
    }),
  ),
  what_didnt_work: z.array(
    z.object({
      argument: z.string(),
      reason: z.string(),
    }),
  ),
  current_ceiling: z.number(),
  potential_ceiling: z.number(),
  skills_to_close_gap: z.array(
    z.object({
      skill: z.string(),
      impact_usd: z.number(),
    }),
  ),
});

export const NegotiationReportRequestSchema = z.object({
  company: CompanyEnum.optional(),
  role: z.string().min(2).max(120).optional(),
  user_profile: z.record(z.string(), z.unknown()).optional(),
  full_conversation: z.array(ConversationMessageSchema).optional(),
  final_offer: z.number().positive(),
  initial_offer: z.number().positive(),
});
