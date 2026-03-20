"use client";

import { useSearchParams } from "next/navigation";

export default function DemoBadge() {
  const searchParams = useSearchParams();
  if (searchParams.get("demo") !== "true") return null;
  return (
    <div className="fixed top-4 right-4 z-50 rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200 border border-violet-400/30">
      Demo Mode
    </div>
  );
}
