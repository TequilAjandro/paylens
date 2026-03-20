"use client";

import { motion } from "framer-motion";
import { BookOpen, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface LearningPhase {
  months: string;
  skill: string;
  why: string;
  milestone: string;
}

interface LearningRoadmapData {
  total_duration: string;
  phases: LearningPhase[];
  summary: string;
}

interface LearningRoadmapProps {
  roadmap: LearningRoadmapData | null;
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

export default function LearningRoadmap({ roadmap }: LearningRoadmapProps) {
  if (!roadmap || roadmap.phases.length === 0) return null;

  return (
    <section className="space-y-4" id="roadmap">
      <h2 className="flex items-center gap-2 text-xl font-bold text-white">
        <BookOpen className="h-5 w-5 text-amber-300" />
        Your Learning Roadmap
      </h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative space-y-4 pl-6"
      >
        {/* Vertical line */}
        <div className="absolute bottom-0 left-2 top-0 w-px bg-gradient-to-b from-amber-400/60 via-violet-400/40 to-transparent" />

        {roadmap.phases.map((phase, index) => (
          <motion.div key={index} variants={item} className="relative">
            {/* Timeline dot */}
            <div className="absolute -left-[1.35rem] top-4 h-3 w-3 rounded-full border-2 border-amber-400 bg-slate-900" />

            <Card className="glass-panel rounded-xl border-slate-700/80">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-amber-400/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                    Month {phase.months}
                  </span>
                  <h3 className="text-base font-bold text-white">{phase.skill}</h3>
                </div>
                <p className="text-sm text-slate-300">{phase.why}</p>
                <div className="flex items-start gap-1.5 rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />
                  <p className="text-sm text-violet-100">
                    <span className="font-medium">Milestone:</span> {phase.milestone}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {roadmap.summary && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: roadmap.phases.length * 0.15 + 0.2, duration: 0.4 }}
          className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100"
        >
          {roadmap.summary}
        </motion.p>
      )}
    </section>
  );
}
