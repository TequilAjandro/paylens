"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, GitBranch, User } from "lucide-react";
import type { GitHubProfileOutput, ManualProfile } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Profile = GitHubProfileOutput | (ManualProfile & { profile_ready?: boolean });

interface ProfileCardProps {
  profile: Profile;
  onContinue: () => void;
}

export default function ProfileCard({ profile, onContinue }: ProfileCardProps) {
  const isGitHub = "username" in profile;
  const skills = isGitHub ? profile.detected_skills : profile.skills;
  const seniority = isGitHub ? profile.estimated_seniority : profile.seniority;
  const years = isGitHub ? profile.years_active : profile.years_experience;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Card className="glass-panel amber-edge rounded-xl border-amber-400/45">
        <CardContent className="space-y-5 p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-amber-200/90">
            Profile Ready
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/20">
              {isGitHub ? (
                <GitBranch className="h-6 w-6 text-amber-300" />
              ) : (
                <User className="h-6 w-6 text-amber-300" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {isGitHub ? profile.username : "Your Profile"}
              </h3>
              <p className="text-sm text-slate-300">
                {seniority.charAt(0).toUpperCase() + seniority.slice(1)} · {years} years
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 12).map((skill) => (
              <Badge key={skill} className="border-violet-400/35 bg-violet-500/20 text-violet-200">
                {skill}
              </Badge>
            ))}
            {skills.length > 12 ? (
              <Badge className="border-slate-600 bg-slate-800 text-slate-300">
                +{skills.length - 12} more
              </Badge>
            ) : null}
          </div>

          {isGitHub && profile.profile_summary ? (
            <p className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm leading-relaxed text-slate-300">
              {profile.profile_summary}
            </p>
          ) : null}

          {isGitHub && profile.notable_patterns.length > 0 ? (
            <ul className="space-y-1 text-sm text-slate-300">
              {profile.notable_patterns.slice(0, 4).map((pattern) => (
                <li key={pattern}>- {pattern}</li>
              ))}
            </ul>
          ) : null}

          {isGitHub ? (
            <div className="flex flex-wrap gap-4 text-sm text-slate-300">
              <span className="flex items-center gap-1">
                <GitBranch className="h-3 w-3" /> {profile.total_repos} repos
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> {profile.years_active} years active
              </span>
            </div>
          ) : null}

          <Button
            onClick={onContinue}
            className="amber-edge pl-cta-btn h-11 w-full"
          >
            Continue to Diagnosis
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
