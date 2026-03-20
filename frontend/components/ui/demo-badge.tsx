"use client";

import { useEffect, useState } from "react";

export default function DemoBadge() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsDemo(params.get("demo") === "true");
  }, []);

  if (!isDemo) return null;
  return (
    <div className="fixed top-4 right-4 z-50 rounded-full border border-amber-400/30 bg-amber-500/20 px-3 py-1 text-xs text-amber-100">
      Demo Mode
    </div>
  );
}
