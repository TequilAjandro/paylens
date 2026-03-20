"use client";
import { useEffect, useState } from "react";

export function useDemoMode(): boolean {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setIsDemo(searchParams.get("demo") === "true");
  }, []);

  return isDemo;
}
