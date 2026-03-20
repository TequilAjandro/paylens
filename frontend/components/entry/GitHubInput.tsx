"use client";

import { useMemo, useState } from "react";
import { Github, Loader2 } from "lucide-react";
import { analyzeGitHub } from "@/lib/api";
import type { GitHubProfileOutput } from "@/lib/types";
import AsyncState from "@/components/ui/async-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface GitHubInputProps {
  onProfileReady: (profile: GitHubProfileOutput) => void;
}

const GITHUB_PROFILE_URL_REGEX = /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/?$/;
const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

export default function GitHubInput({ onProfileReady }: GitHubInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "calling" | "thinking" | "loaded">("idle");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const cleanedInput = useMemo(() => url.trim(), [url]);
  const isValidInput = useMemo(
    () => GITHUB_PROFILE_URL_REGEX.test(cleanedInput) || GITHUB_USERNAME_REGEX.test(cleanedInput),
    [cleanedInput],
  );
  const showInlineError = touched && cleanedInput.length > 0 && !isValidInput;
  const hasError = showInlineError || Boolean(error);
  const displayError = showInlineError ? "Use a full GitHub profile URL or a username only." : error;

  const handleSubmit = async () => {
    setTouched(true);

    if (!isValidInput) {
      setError("Enter a valid GitHub profile URL or username");
      return;
    }

    setError(null);
    setIsLoading(true);
    setStatus("calling");

    const thinkingTimer = setTimeout(() => setStatus("thinking"), 450);

    try {
      const profile = await analyzeGitHub(cleanedInput.replace(/\/$/, ""));
      setStatus("loaded");
      onProfileReady(profile);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "";
      const contractError = /API error 422/i.test(message);
      setError(
        contractError
          ? "Input format is invalid for the API contract. Use a GitHub URL or username."
          : "Failed to analyze GitHub profile. Please try again.",
      );
      setStatus("error");
    } finally {
      clearTimeout(thinkingTimer);
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
            <p className="text-xs text-slate-300">We parse repos, languages, and contribution patterns.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="github-profile-input"
            placeholder="https://github.com/username"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              if (!touched) return;
              setError(null);
            }}
            onBlur={() => setTouched(true)}
            className={`h-11 bg-slate-900/90 text-white placeholder:text-slate-500 focus-visible:border-emerald-400/70 focus-visible:ring-emerald-500/30 ${
              showInlineError ? "border-rose-500/70" : "border-slate-600"
            }`}
            aria-invalid={hasError}
            aria-describedby={hasError ? "github-input-error" : "github-input-help"}
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !cleanedInput || !isValidInput}
            className="emerald-edge h-11 min-w-[156px] bg-emerald-600 text-white hover:bg-emerald-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {status === "calling" ? "Calling API..." : "Thinking..."}
              </>
            ) : (
              "Analyze Profile"
            )}
          </Button>
        </div>
        <p id="github-input-help" className="text-xs text-slate-300">
          Example: <span className="text-slate-300">https://github.com/octocat</span> or{" "}
          <span className="text-slate-300">octocat</span>
        </p>

        {displayError ? (
          <p
            id="github-input-error"
            role="alert"
            aria-live="polite"
            className={`text-sm ${showInlineError ? "text-rose-300" : "text-red-400"}`}
          >
            {displayError}
          </p>
        ) : null}

        <AsyncState
          state={status}
          labels={{
            calling: "Calling GitHub profile endpoint...",
            thinking: "AI is thinking through your repository signal...",
            loaded: "Profile analyzed successfully",
            error: "GitHub profile analysis failed",
          }}
        />

        {isLoading ? (
          <div className="space-y-3 rounded-lg border border-slate-700/80 bg-slate-900/70 p-3 pt-4">
            <Skeleton className="h-4 w-3/4 bg-slate-800" />
            <Skeleton className="h-4 w-1/2 bg-slate-800" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
