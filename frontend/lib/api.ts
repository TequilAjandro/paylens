import type {
  DiagnosisResponse,
  GitHubProfileOutput,
  ManualProfile,
  NegotiateResponse,
  NegotiationReport,
  WhatIfResponse,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiCall<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
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
  return apiCall<GitHubProfileOutput>("/api/profile/github", {
    github_url: githubUrl,
  });
}

export function submitManualProfile(profile: ManualProfile) {
  return apiCall<ManualProfileResponse>("/api/profile/manual", profile);
}

export function getDiagnosis(profile: ManualProfile) {
  return apiCall<DiagnosisResponse>("/api/diagnosis", profile);
}

export function getWhatIf(params: {
  current_skills: string[];
  hypothetical_add: string[];
  hypothetical_remove: string[];
  seniority: string;
  location: string;
}) {
  return apiCall<WhatIfResponse>("/api/what-if", params);
}

export function negotiate(params: NegotiateRequest) {
  return apiCall<NegotiateResponse>("/api/negotiate", params);
}

export function getNegotiationReport(params: Record<string, unknown>) {
  return apiCall<NegotiationReport>("/api/negotiate/report", params);
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
