import type {
  DiagnosisResponse,
  GitHubProfileOutput,
  ManualProfile,
  NegotiateResponse,
  NegotiationReport,
  WhatIfResponse,
} from "@/lib/types";
import {
  DiagnosisResponseSchema,
  GitHubProfileOutputSchema,
  ManualProfileSchema,
  NegotiateResponseSchema,
  NegotiationReportSchema,
  WhatIfResponseSchema,
} from "@/lib/schemas";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const API_TIMEOUT_MS = 12_000;

async function apiCall<T>(endpoint: string, body: unknown, parse: (input: unknown) => T): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: controller.signal,
  });
  clearTimeout(timeout);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  return parse(payload);
}

export type ManualProfileResponse = ManualProfile & {
  profile_ready?: boolean;
};

export type NegotiateRequest = {
  company: string;
  role: string;
  user_profile: Record<string, unknown>;
  conversation_history: Array<{ role: string; content: string }>;
  user_message: string;
};

export function analyzeGitHub(githubUrl: string) {
  const cleaned = githubUrl.trim().replace(/\/$/, "");
  const username = cleaned.replace(/^https?:\/\/github\.com\//i, "").split("/")[0];

  return apiCall<GitHubProfileOutput>(
    "/api/profile/github",
    {
      github_username: username || cleaned,
      github_url: cleaned,
    },
    (payload) => GitHubProfileOutputSchema.parse(payload),
  );
}

export function submitManualProfile(profile: ManualProfile) {
  return apiCall<ManualProfileResponse>("/api/profile/manual", profile, (payload) => {
    const parsed = ManualProfileSchema.parse(payload);
    return { ...parsed, profile_ready: (payload as { profile_ready?: boolean }).profile_ready };
  });
}

export function getDiagnosis(profile: ManualProfile) {
  return apiCall<DiagnosisResponse>("/api/diagnosis", profile, (payload) => DiagnosisResponseSchema.parse(payload));
}

export function getWhatIf(params: {
  current_skills: string[];
  hypothetical_add: string[];
  hypothetical_remove: string[];
  seniority: string;
  location: string;
}) {
  return apiCall<WhatIfResponse>("/api/what-if", params, (payload) => WhatIfResponseSchema.parse(payload));
}

export function negotiate(params: NegotiateRequest) {
  return apiCall<NegotiateResponse>("/api/negotiate", params, (payload) => NegotiateResponseSchema.parse(payload));
}

export function getNegotiationReport(params: Record<string, unknown>) {
  return apiCall<NegotiationReport>("/api/negotiate/report", params, (payload) =>
    NegotiationReportSchema.parse(payload),
  );
}

export async function checkHealth(): Promise<{
  status: string;
  gemini: boolean;
  groq: boolean;
}> {
  const response = await fetch(`${API_BASE}/health`);
  return response.json() as Promise<{
    status: string;
    gemini: boolean;
    groq: boolean;
  }>;
}
