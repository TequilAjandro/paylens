"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, X } from "lucide-react";
import type { ManualProfile } from "@/lib/types";
import { submitManualProfile } from "@/lib/api";
import AsyncState from "@/components/ui/async-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const SKILL_OPTIONS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Java",
  "Go",
  "Rust",
  "C#",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "FastAPI",
  "Django",
  "Spring",
  "Angular",
  "Vue",
  "SQL",
  "CI/CD",
  "Terraform",
  "GraphQL",
  "Kafka",
  "React Native",
  "Swift",
];

const SENIORITY_OPTIONS = ["junior", "mid", "senior", "staff"] as const;

const LOCATION_OPTIONS = [
  "Mexico",
  "Colombia",
  "Argentina",
  "Brazil",
  "Chile",
  "Peru",
  "Other LATAM",
] as const;

interface QuickInputFormProps {
  onProfileReady: (profile: ManualProfile & { profile_ready?: boolean }) => void;
}

export default function QuickInputForm({ onProfileReady }: QuickInputFormProps) {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [seniority, setSeniority] = useState<(typeof SENIORITY_OPTIONS)[number]>("mid");
  const [location, setLocation] = useState<(typeof LOCATION_OPTIONS)[number]>("Mexico");
  const [yearsExperience, setYearsExperience] = useState(3);
  const [currentRole, setCurrentRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "calling" | "thinking" | "loaded">("idle");
  const [error, setError] = useState<string | null>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const filteredSkills = useMemo(
    () =>
      SKILL_OPTIONS.filter(
        (skill) =>
          skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
          !skills.includes(skill),
      ),
    [skillSearch, skills],
  );

  const addSkill = (skill: string) => {
    if (skills.length >= 20 || skills.includes(skill)) return;
    setSkills((prev) => [...prev, skill]);
    setSkillSearch("");
  };

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((item) => item !== skill));
  };

  const skillsReady = skills.length > 0;
  const roleReady = currentRole.trim().length >= 2;
  const minimumReady = skillsReady && roleReady;
  const roleInvalid = attemptedSubmit && !roleReady;
  const skillsInvalid = attemptedSubmit && !skillsReady;

  const handleSubmit = async () => {
    setAttemptedSubmit(true);

    if (skills.length === 0) {
      setError("Select at least one skill");
      return;
    }

    if (!currentRole.trim()) {
      setError("Enter your current role");
      return;
    }

    setError(null);
    setIsLoading(true);
    setStatus("calling");
    const thinkingTimer = setTimeout(() => setStatus("thinking"), 350);

    try {
      const profile = await submitManualProfile({
        skills,
        seniority,
        location,
        years_experience: Math.max(0, Math.min(50, yearsExperience)),
        current_role: currentRole.trim(),
      });
      setStatus("loaded");
      onProfileReady(profile);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "";
      const contractError = /API error 422/i.test(message);
      setError(
        contractError
          ? "Some fields are invalid for the API contract. Check required values."
          : "Failed to submit profile. Please try again.",
      );
      setStatus("error");
    } finally {
      clearTimeout(thinkingTimer);
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-panel rounded-xl border-slate-700/80">
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">Minimum Required</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className={skillsReady ? "text-amber-200" : "text-slate-300"}>
              {skillsReady ? <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> : null}
              At least one skill selected
            </p>
            <p className={roleReady ? "text-amber-200" : "text-slate-300"}>
              {roleReady ? <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" /> : null}
              Current role (2+ characters)
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Skills</label>

          <div
            className={`flex min-h-[34px] flex-wrap gap-1.5 rounded-lg bg-slate-900/60 p-2 ${
              skillsInvalid ? "border border-rose-500/60" : "border border-slate-700/70"
            }`}
            role="group"
            aria-invalid={skillsInvalid}
            aria-describedby={skillsInvalid ? "quick-input-error" : undefined}
          >
            {skills.map((skill) => (
              <Badge
                key={skill}
                className="cursor-pointer border-violet-400/35 bg-violet-500/20 text-violet-100 hover:border-rose-500/45 hover:bg-rose-500/18 hover:text-rose-100"
                onClick={() => removeSkill(skill)}
              >
                {skill}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
          </div>

          <div className="relative">
            <Input
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(event) => setSkillSearch(event.target.value)}
              className="h-11 border-slate-600 bg-slate-900/90 text-white placeholder:text-slate-500 focus-visible:border-amber-400/70 focus-visible:ring-amber-500/30"
              disabled={isLoading}
            />
            {skillSearch && filteredSkills.length > 0 ? (
              <div className="absolute z-20 mt-1 max-h-44 w-full overflow-y-auto rounded-md border border-slate-600 bg-slate-900 shadow-xl">
                {filteredSkills.slice(0, 8).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-700"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Seniority
          </label>
          <div className="flex flex-wrap gap-2">
            {SENIORITY_OPTIONS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setSeniority(level)}
                className={
                  seniority === level
                    ? "rounded-full border border-amber-300/60 bg-amber-500 px-3.5 py-1.5 text-sm font-medium text-slate-950 shadow-[0_0_0_1px_rgba(245,158,11,0.45)]"
                    : "rounded-full border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
                }
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Location
          </label>
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value as (typeof LOCATION_OPTIONS)[number])}
            className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-sm text-white focus:border-amber-500/60 focus:outline-none"
            disabled={isLoading}
          >
            {LOCATION_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Years of Experience
            </label>
            <Input
              type="number"
              min={0}
              max={50}
              value={yearsExperience}
              onChange={(event) => setYearsExperience(Number(event.target.value))}
              className="h-11 border-slate-600 bg-slate-900/90 text-white"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              Current Role
            </label>
            <Input
              id="quick-input-current-role"
              placeholder="Backend Developer"
              value={currentRole}
              onChange={(event) => {
                setCurrentRole(event.target.value);
                if (error) setError(null);
              }}
              className={`h-11 bg-slate-900/90 text-white placeholder:text-slate-500 ${
                roleInvalid ? "border-rose-500/70" : "border-slate-600"
              }`}
              aria-invalid={roleInvalid}
              aria-describedby={roleInvalid || error ? "quick-input-error" : undefined}
              disabled={isLoading}
            />
          </div>
        </div>

        {error ? (
          <p id="quick-input-error" role="alert" aria-live="polite" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <AsyncState
          state={status}
          labels={{
            calling: "Calling profile API...",
            thinking: "Validating profile and preparing diagnosis context...",
            loaded: "Profile submitted successfully",
            error: "Profile submission failed",
          }}
        />

        <Button onClick={handleSubmit} disabled={isLoading || !minimumReady} className="emerald-edge pl-cta-btn h-11 w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {status === "calling" ? "Calling API..." : "Thinking..."}
            </>
          ) : (
            "Get My Diagnosis"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
