"use client";

import { useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import type { ManualProfile } from "@/lib/types";
import { submitManualProfile } from "@/lib/api";
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
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
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

    try {
      const profile = await submitManualProfile({
        skills,
        seniority,
        location,
        years_experience: Math.max(0, Math.min(50, yearsExperience)),
        current_role: currentRole.trim(),
      });
      onProfileReady(profile);
    } catch {
      setError("Failed to submit profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-panel rounded-xl border-slate-700/80">
      <CardContent className="space-y-6 p-6 sm:p-7">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Skills</label>

          <div className="flex min-h-[34px] flex-wrap gap-1.5 rounded-lg border border-slate-700/70 bg-slate-900/60 p-2">
            {skills.map((skill) => (
              <Badge
                key={skill}
                className="cursor-pointer border-emerald-400/35 bg-emerald-500/20 text-emerald-200 hover:border-red-500/40 hover:bg-red-500/20 hover:text-red-300"
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
              className="h-11 border-slate-600 bg-slate-900/90 text-white placeholder:text-slate-500 focus-visible:border-emerald-400/70 focus-visible:ring-emerald-500/30"
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
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
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
                    ? "rounded-full border border-emerald-300/60 bg-emerald-500 px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(16,185,129,0.45)]"
                    : "rounded-full border border-slate-700 bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800"
                }
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Location
          </label>
          <select
            value={location}
            onChange={(event) => setLocation(event.target.value as (typeof LOCATION_OPTIONS)[number])}
            className="h-11 w-full rounded-lg border border-slate-600 bg-slate-900/90 px-3 py-2 text-sm text-white focus:border-emerald-500/60 focus:outline-none"
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
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
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
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Current Role
            </label>
            <Input
              placeholder="Backend Developer"
              value={currentRole}
              onChange={(event) => setCurrentRole(event.target.value)}
              className="h-11 border-slate-600 bg-slate-900/90 text-white placeholder:text-slate-500"
              disabled={isLoading}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="emerald-edge h-11 w-full bg-emerald-600 text-white hover:bg-emerald-500"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Get My Diagnosis"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
