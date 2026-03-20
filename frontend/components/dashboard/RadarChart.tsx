"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import InfoTooltip from "@/components/ui/info-tooltip";

interface PeerComparison {
  axes: string[];
  user_values: number[];
  peer_avg_values: number[];
  seniority_group: string;
  region: string;
  overall_percentile: number;
  percentile_label: string;
}

interface RadarChartProps {
  peerComparison: PeerComparison;
}

const DEFAULT_AXES = ["Frontend", "Backend", "DevOps", "Data", "AI/ML", "Soft Skills"];
const DEFAULT_USER = [3, 8, 4, 6, 2, 7];
const DEFAULT_PEERS = [6, 7, 6, 5, 4, 6];

export default function SkillRadarChart({ peerComparison }: RadarChartProps) {
  const [showUser, setShowUser] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowUser(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const axes = peerComparison.axes.length > 0 ? peerComparison.axes : DEFAULT_AXES;
  const userValues = peerComparison.user_values.length > 0 ? peerComparison.user_values : DEFAULT_USER;
  const peerValues =
    peerComparison.peer_avg_values.length > 0 ? peerComparison.peer_avg_values : DEFAULT_PEERS;

  const chartData = useMemo(
    () =>
      axes.map((axis, index) => ({
        subject: axis,
        user: Math.max(0, Math.min(10, userValues[index] ?? 0)),
        peers: Math.max(0, Math.min(10, peerValues[index] ?? 0)),
        fullMark: 10,
      })),
    [axes, userValues, peerValues],
  );

  const locationText = peerComparison.region || "LATAM";
  const seniorityText = peerComparison.seniority_group || "mid-level";
  const percentileText =
    peerComparison.percentile_label || `Top ${peerComparison.overall_percentile || 34}%`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Card className="glass-panel rounded-xl border-slate-700/80">
        <CardHeader className="space-y-2">
          <CardTitle className="flex flex-col justify-between gap-2 text-white sm:flex-row sm:items-center">
            <span className="inline-flex items-center gap-1.5">
              Market Benchmark · You vs Market
              <InfoTooltip text="Compares your skill profile versus peers at similar seniority and region." />
            </span>
            <Badge className="border-violet-400/35 bg-violet-500/15 text-violet-100">{percentileText}</Badge>
          </CardTitle>
          <p className="text-sm text-slate-300">
            Compared against {seniorityText} developers in {locationText}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 focus-within:outline-none [&_svg_*]:outline-none [&_svg_*]:focus:outline-none [&_svg_*]:focus-visible:outline-none">
          <ResponsiveContainer width="100%" height={400}>
            <RechartsRadarChart
              accessibilityLayer={false}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={chartData}
            >
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#cbd5e1", fontSize: 14 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#94a3b8", fontSize: 11 }} />

              <Radar
                name="Market Average"
                dataKey="peers"
                stroke="#a78bfa"
                fill="#a78bfa"
                fillOpacity={0.08}
                strokeWidth={2}
                strokeDasharray="5 5"
              />

              {showUser ? (
                <Radar
                  name="You"
                  dataKey="user"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.24}
                  strokeWidth={2.5}
                  isAnimationActive
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              ) : null}

              <Legend wrapperStyle={{ color: "#94a3b8", paddingTop: 20 }} />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #6b7280",
                  borderRadius: 10,
                  color: "#f1f5f9",
                }}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {chartData.map((item) => {
              const diff = Number((item.user - item.peers).toFixed(1));
              return (
                <div
                  key={item.subject}
                  className="rounded-lg border border-slate-700/70 bg-slate-900/55 p-3 text-center"
                >
                  <p className="text-xs text-slate-300">{item.subject}</p>
                  <p className="font-mono text-lg font-bold text-white">
                    <AnimatedCounter value={item.user} duration={1} suffix="/10" />
                  </p>
                  <p className={`text-xs ${diff >= 0 ? "text-amber-300" : "text-rose-300"}`}>
                    {diff >= 0 ? `+${diff}` : diff} vs peers
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
