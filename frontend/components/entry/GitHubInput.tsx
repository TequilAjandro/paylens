"use client";

import { useMemo, useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { analyzeGitHub } from "@/lib/api";
import type { GitHubProfileOutput } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface GitHubInputProps {
  onProfileReady: (profile: GitHubProfileOutput) => void;
}

const GITHUB_PROFILE_REGEX = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/;

export default function GitHubInput({ onProfileReady }: GitHubInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = useMemo(() => GITHUB_PROFILE_REGEX.test(url), [url]);

  const handleSubmit = async () => {
    if (!isValidUrl) {
      setError("Enter a valid GitHub profile URL (e.g., https://github.com/username)");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const profile = await analyzeGitHub(url.replace(/\/$/, ""));
      onProfileReady(profile);
    } catch {
      setError("Failed to analyze GitHub profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-panel rounded-xl border-slate-700/80">
      <CardContent className="space-y-4 p-6 sm:p-7">
        <div className="flex items-center gap-2 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800/90 ring-1 ring-slate-600">
            <Github className="h-4 w-4 text-emerald-300" />
          </span>
          <div>
            <p className="font-semibold">Paste your GitHub profile URL</p>
            <p className="text-xs text-slate-400">We parse repos, languages, and contribution patterns.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="https://github.com/username"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="h-11 border-slate-600 bg-slate-900/90 text-white placeholder:text-slate-500 focus-visible:border-emerald-400/70 focus-visible:ring-emerald-500/30"
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !url}
            className="emerald-edge h-11 min-w-[156px] bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Profile"
            )}
          </Button>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {isLoading ? (
          <div className="space-y-3 rounded-lg border border-slate-700/80 bg-slate-900/70 p-3 pt-4">
            <Skeleton className="h-4 w-3/4 bg-slate-800" />
            <Skeleton className="h-4 w-1/2 bg-slate-800" />
            <p className="text-sm text-slate-400">Analyzing repositories...</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
