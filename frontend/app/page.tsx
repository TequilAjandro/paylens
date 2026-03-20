"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { GitHubProfileOutput, ManualProfile } from "@/lib/types";
import GitHubInput from "@/components/entry/GitHubInput";
import ProfileCard from "@/components/entry/ProfileCard";
import QuickInputForm from "@/components/entry/QuickInputForm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEMO_PROFILE } from "@/data/demo-data";
import { useDemoMode } from "@/lib/use-demo-mode";

type EntryProfile = GitHubProfileOutput | (ManualProfile & { profile_ready?: boolean });
type EntryTab = "github" | "manual";

const ENTRY_COPY = {
  title: "PayLens",
  subtitle: "Know your true market value with market-grounded signals from 49,000 developer profiles.",
  chips: [
    {
      label: "GitHub profile analysis in seconds",
      className: "pl-chip-insight",
    },
    {
      label: "Quick manual setup",
      className: "pl-chip-success",
    },
    {
      label: "Instant salary positioning preview",
      className: "rounded-full border border-amber-400/45 bg-amber-500/15 text-amber-100",
    },
  ],
};

export default function EntryPage() {
  const router = useRouter();
  const isDemo = useDemoMode();
  const [profile, setProfile] = useState<EntryProfile | null>(null);
  const [activeTab, setActiveTab] = useState<EntryTab>("github");

  useEffect(() => {
    if (isDemo) {
      sessionStorage.setItem("userProfile", JSON.stringify(DEMO_PROFILE));
      router.push("/dashboard?demo=true");
    }
  }, [isDemo, router]);

  const handleProfileReady = (data: EntryProfile) => {
    setProfile(data);
    sessionStorage.setItem("userProfile", JSON.stringify(data));
  };

  const handleContinue = () => {
    const demoParam = isDemo ? "?demo=true" : "";
    router.push(`/dashboard${demoParam}`);
  };

  return (
    <main className="pl-bg-main relative flex min-h-screen items-center justify-center overflow-hidden p-4 sm:p-6">
      <div className="paylens-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-violet-500/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-500/16 blur-3xl" />

      {isDemo && (
        <div className="fixed top-4 right-4 z-50 rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-200 border border-violet-400/30">
          Demo Mode
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="glass-panel relative z-10 w-full max-w-3xl rounded-2xl p-5 sm:p-8"
      >
        <div className="mb-7 space-y-3 text-center">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
            <span className="pl-title-accent">{ENTRY_COPY.title}</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-200 sm:text-lg">
            {ENTRY_COPY.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-medium text-slate-200">
            {ENTRY_COPY.chips.map((chip) => (
              <span
                key={chip.label}
                className={`rounded-full border px-2.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${chip.className}`}
              >
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        {!profile ? (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as EntryTab)}
            className="flex-col w-full"
          >
            <div className="relative h-12 w-full rounded-full border border-slate-600/90 bg-slate-900/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <motion.div
                className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full border border-amber-400/70 bg-slate-700 shadow-[0_0_0_1px_rgba(245,158,11,0.4)]"
                initial={false}
                animate={{ x: activeTab === "github" ? "0%" : "100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.7 }}
              />

              <TabsList className="relative z-10 grid h-full w-full grid-cols-2 bg-transparent p-0">
                <TabsTrigger
                  value="github"
                  className="h-10 rounded-full border border-transparent text-slate-300 aria-selected:font-semibold aria-selected:text-amber-100 data-active:font-semibold data-active:text-amber-100 focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-0"
                >
                  GitHub Profile
                </TabsTrigger>
                <TabsTrigger
                  value="manual"
                  className="h-10 rounded-full border border-transparent text-slate-300 aria-selected:font-semibold aria-selected:text-amber-100 data-active:font-semibold data-active:text-amber-100 focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-0"
                >
                  Quick Input
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="mt-4 w-full overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  {activeTab === "github" ? (
                    <GitHubInput onProfileReady={handleProfileReady} />
                  ) : (
                    <QuickInputForm onProfileReady={handleProfileReady} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        ) : (
          <ProfileCard profile={profile} onContinue={handleContinue} />
        )}
      </motion.div>
    </main>
  );
}
