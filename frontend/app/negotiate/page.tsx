"use client";

import { useMemo, useState } from "react";
import CompanySelector, { type NegotiationCompany } from "@/components/negotiate/CompanySelector";
import NegotiationChat from "@/components/negotiate/NegotiationChat";
import NegotiationReport from "@/components/negotiate/NegotiationReport";
import { getNegotiationReport } from "@/lib/api";
import type { ManualProfile, NegotiationReport as NegotiationReportType } from "@/lib/types";
import { DEMO_PROFILE } from "@/data/demo-data";
import AsyncState from "@/components/ui/async-state";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ROLE_BASELINE_SALARY: Record<NegotiationCompany["id"], number> = {
  mercadolibre: 48000,
  globant: 42000,
  nubank: 58000,
  rappi: 39000,
};

function isManualProfile(profile: unknown): profile is ManualProfile {
  if (!profile || typeof profile !== "object") return false;
  const candidate = profile as Partial<ManualProfile>;
  return (
    Array.isArray(candidate.skills) &&
    typeof candidate.seniority === "string" &&
    typeof candidate.location === "string" &&
    typeof candidate.years_experience === "number" &&
    typeof candidate.current_role === "string"
  );
}

function toNegotiationProfile(profile: unknown): ManualProfile {
  if (!profile || typeof profile !== "object") return DEMO_PROFILE;

  if ("username" in profile) {
    const githubProfile = profile as {
      detected_skills?: string[];
      estimated_seniority?: ManualProfile["seniority"];
      years_active?: number;
    };

    return {
      skills: githubProfile.detected_skills?.slice(0, 20) || DEMO_PROFILE.skills,
      seniority: githubProfile.estimated_seniority || DEMO_PROFILE.seniority,
      location: "Mexico",
      years_experience: githubProfile.years_active ?? DEMO_PROFILE.years_experience,
      current_role: "Software Engineer",
    };
  }

  if (isManualProfile(profile)) return profile;
  return DEMO_PROFILE;
}

export default function NegotiatePage() {
  const [selectedCompany, setSelectedCompany] = useState<NegotiationCompany | null>(null);
  const [report, setReport] = useState<NegotiationReportType | null>(null);
  const [reportStatus, setReportStatus] = useState<"idle" | "calling" | "thinking" | "loaded" | "error">("idle");

  const userProfile = useMemo(() => {
    if (typeof window === "undefined") return DEMO_PROFILE;
    const stored = sessionStorage.getItem("userProfile");
    if (!stored) return DEMO_PROFILE;

    try {
      return toNegotiationProfile(JSON.parse(stored));
    } catch {
      return DEMO_PROFILE;
    }
  }, []);

  const handleNegotiationComplete = async (conversation: ChatMessage[], finalOffer: number, initialOffer: number) => {
    if (!selectedCompany) return;

    setReportStatus("calling");
    const thinkingTimer = setTimeout(() => setReportStatus("thinking"), 420);

    try {
      const response = await getNegotiationReport({
        company: selectedCompany.id,
        role: selectedCompany.role,
        user_profile: userProfile,
        full_conversation: conversation,
        final_offer: finalOffer,
        initial_offer: initialOffer,
      });
      setReport(response);
      setReportStatus("loaded");
    } catch {
      const base = ROLE_BASELINE_SALARY[selectedCompany.id];
      const resolvedInitial = initialOffer || base;
      const resolvedFinal = finalOffer || base + 2500;
      const negotiatedIncrease = Math.max(0, resolvedFinal - resolvedInitial);

      setReport({
        final_offer: resolvedFinal,
        initial_offer: resolvedInitial,
        negotiated_increase: negotiatedIncrease,
        what_worked: [
          { argument: "Quantified reliability impact and incident reduction", impact_usd: 2500 },
          { argument: "Ownership of cross-team delivery execution", impact_usd: 1800 },
        ],
        what_didnt_work: [
          { argument: "Generic market-rate comparison", reason: "Lacked role-specific benchmark evidence." },
        ],
        current_ceiling: resolvedFinal + 3000,
        potential_ceiling: resolvedFinal + 24000,
        skills_to_close_gap: [
          { skill: "Kubernetes", impact_usd: 12000 },
          { skill: "CI/CD", impact_usd: 7000 },
          { skill: "Observability", impact_usd: 5000 },
        ],
      });
      setReportStatus("error");
    } finally {
      clearTimeout(thinkingTimer);
    }
  };

  if (report) {
    return <NegotiationReport report={report} />;
  }

  if (!selectedCompany) {
    return <CompanySelector onSelect={setSelectedCompany} />;
  }

  return (
    <>
      {reportStatus !== "idle" && reportStatus !== "loaded" ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <div className="rounded-lg border border-slate-600/80 bg-slate-950/80 px-3 py-2 backdrop-blur-sm">
            <AsyncState
              state={reportStatus}
              labels={{
                calling: "Calling report endpoint...",
                thinking: "Generating negotiation report...",
              }}
            />
          </div>
        </div>
      ) : null}
      <NegotiationChat
        companyId={selectedCompany.id}
        companyName={selectedCompany.name}
        roleTitle={selectedCompany.role}
        userProfile={userProfile}
        onComplete={handleNegotiationComplete}
      />
    </>
  );
}
