"use client";

import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export type AsyncStateValue = "idle" | "calling" | "thinking" | "loaded" | "error";

const DEFAULT_LABELS: Record<AsyncStateValue, string> = {
  idle: "",
  calling: "Calling API...",
  thinking: "AI thinking...",
  loaded: "Loaded",
  error: "Request failed",
};

interface AsyncStateProps {
  state: AsyncStateValue;
  labels?: Partial<Record<AsyncStateValue, string>>;
  className?: string;
}

export default function AsyncState({ state, labels, className }: AsyncStateProps) {
  if (state === "idle") return null;

  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  const label = mergedLabels[state];

  let icon: ReactNode = null;
  let toneClass = "text-slate-300";

  if (state === "calling" || state === "thinking") {
    icon = <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    toneClass = "text-slate-300";
  } else if (state === "loaded") {
    icon = <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />;
    toneClass = "text-emerald-200";
  } else if (state === "error") {
    icon = <AlertCircle className="h-3.5 w-3.5 text-rose-300" />;
    toneClass = "text-rose-200";
  }

  return (
    <p className={`inline-flex items-center gap-2 text-sm ${toneClass} ${className ?? ""}`.trim()}>
      {icon}
      <span>{label}</span>
    </p>
  );
}
