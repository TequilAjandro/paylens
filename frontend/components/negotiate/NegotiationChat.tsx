"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send } from "lucide-react";
import { negotiate } from "@/lib/api";
import type { ManualProfile } from "@/lib/types";
import AsyncState from "@/components/ui/async-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface NegotiationChatProps {
  companyId: "mercadolibre" | "globant" | "nubank" | "rappi";
  companyName: string;
  roleTitle: string;
  userProfile: ManualProfile;
  reportStatus: "idle" | "calling" | "thinking" | "loaded" | "error";
  onComplete: (conversation: ChatMessage[], finalOffer: number, initialOffer: number) => void;
}

type NegotiateApiResponse = {
  ai_response: string;
  current_offer: number;
  turn_number: number;
  negotiation_complete: boolean;
};

const OPENING_OFFERS: Record<NegotiationChatProps["companyId"], number> = {
  mercadolibre: 48000,
  globant: 42000,
  nubank: 58000,
  rappi: 39000,
};

const FALLBACK_OPENERS: Record<NegotiationChatProps["companyId"], string> = {
  mercadolibre:
    "Thanks for your time today. For this role we can start with an offer around $48,000 USD/year. Help me understand why we should move higher.",
  globant:
    "Great to meet you. The initial package is $42,000 USD/year. Share your strongest business-impact argument for an adjustment.",
  nubank:
    "Welcome. For this position, our starting point is $58,000 USD/year. What outcomes justify a higher number?",
  rappi:
    "Thanks for joining. Our initial offer is $39,000 USD/year. Convince me with impact and delivery scope.",
};

export default function NegotiationChat({
  companyId,
  companyName,
  roleTitle,
  userProfile,
  reportStatus,
  onComplete,
}: NegotiationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(0);
  const [initialOffer, setInitialOffer] = useState(0);
  const [turnNumber, setTurnNumber] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestPhase, setRequestPhase] = useState<"idle" | "calling" | "thinking">("idle");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    const startNegotiation = async () => {
      setLoading(true);
      setRequestPhase("calling");
      setError(null);
      const thinkingTimer = setTimeout(() => setRequestPhase("thinking"), 420);

      try {
        const response = (await negotiate({
          company: companyId,
          role: roleTitle,
          user_profile: userProfile,
          conversation_history: [],
          user_message: "START_NEGOTIATION",
        })) as NegotiateApiResponse;

        const openingOffer = Number.isFinite(response.current_offer) ? response.current_offer : OPENING_OFFERS[companyId];
        setMessages([{ role: "assistant", content: response.ai_response }]);
        setCurrentOffer(openingOffer);
        setInitialOffer(openingOffer);
        setTurnNumber(response.turn_number || 1);
        if (response.negotiation_complete) setIsComplete(true);
      } catch {
        const fallbackOffer = OPENING_OFFERS[companyId];
        setMessages([{ role: "assistant", content: FALLBACK_OPENERS[companyId] }]);
        setCurrentOffer(fallbackOffer);
        setInitialOffer(fallbackOffer);
        setTurnNumber(1);
        setError("Live negotiation is temporarily unavailable. Running in local simulation mode.");
      } finally {
        clearTimeout(thinkingTimer);
        setRequestPhase("idle");
        setLoading(false);
      }
    };

    void startNegotiation();
  }, [companyId, roleTitle, userProfile]);

  useEffect(() => {
    if (!scrollerRef.current) return;
    scrollerRef.current.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(userMessage: string) {
    const nextMessages = userMessage ? [...messages, { role: "user" as const, content: userMessage }] : messages;

    if (userMessage) {
      setMessages(nextMessages);
    }

    setLoading(true);
    setRequestPhase("calling");
    setError(null);
    setInput("");
    const thinkingTimer = setTimeout(() => setRequestPhase("thinking"), 420);

    try {
      const response = (await negotiate({
        company: companyId,
        role: roleTitle,
        user_profile: userProfile,
        conversation_history: nextMessages,
        user_message: userMessage || "START_NEGOTIATION",
      })) as NegotiateApiResponse;

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.ai_response,
      };
      const merged = [...nextMessages, assistantMessage];
      const safeOffer = Number.isFinite(response.current_offer) ? response.current_offer : currentOffer;

      setMessages(merged);
      setCurrentOffer(safeOffer);
      setTurnNumber(response.turn_number || turnNumber + (userMessage ? 1 : 0));
      if (initialOffer === 0 && safeOffer > 0) setInitialOffer(safeOffer);

      const reachedTurnCap = (response.turn_number || 0) >= 5;
      const aiClosed = response.negotiation_complete || /final offer|best offer|last offer/i.test(response.ai_response);
      if (reachedTurnCap || aiClosed) {
        setIsComplete(true);
      }
    } catch {
      const base = OPENING_OFFERS[companyId];
      const fallbackOpening = FALLBACK_OPENERS[companyId];

      if (messages.length === 0) {
        setMessages([{ role: "assistant", content: fallbackOpening }]);
        setInitialOffer(base);
        setCurrentOffer(base);
        setTurnNumber(1);
      } else {
        const offerBump = Math.round(Math.max(500, base * 0.02));
        const candidate = Math.min(base + offerBump * (turnNumber + 1), base + 6000);
        const fallbackReply =
          "I can move slightly based on your argument, but I need stronger evidence tied to measurable outcomes and scope.";
        const merged = [...nextMessages, { role: "assistant" as const, content: fallbackReply }];

        setMessages(merged);
        setCurrentOffer(candidate);
        setTurnNumber((value) => value + 1);
        if (initialOffer === 0) setInitialOffer(base);
        if (turnNumber + 1 >= 5) {
          setIsComplete(true);
        }
      }

      setError("Live negotiation is temporarily unavailable. Running in local simulation mode.");
    } finally {
      clearTimeout(thinkingTimer);
      setRequestPhase("idle");
      setLoading(false);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || loading || isComplete) return;
    void sendMessage(input.trim());
  };

  const modeLabel = error ? "Simulated mode" : "Live mode";
  const modeClass = error
    ? "border-amber-400/35 bg-amber-500/10 text-amber-100"
    : "border-emerald-400/35 bg-emerald-500/10 text-emerald-100";

  return (
    <main className="pl-bg-main relative min-h-screen overflow-hidden p-4 sm:p-6">
      <div className="paylens-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex h-[calc(100vh-2rem)] max-w-4xl flex-col gap-4 sm:h-[calc(100vh-3rem)]">
        <Card className="rounded-xl border-emerald-400/35 bg-slate-900/75 px-4 py-3 sm:px-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Negotiation Session</p>
              <h1 className="text-lg font-bold text-white sm:text-xl">
                Negotiating with {companyName}
              </h1>
              <p className="text-sm text-slate-300">{roleTitle}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${modeClass}`}>
                  {modeLabel}
                </span>
                {reportStatus === "calling" || reportStatus === "thinking" ? (
                  <span className="rounded-md border border-cyan-400/35 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100">
                    {reportStatus === "calling" ? "Report: Calling API" : "Report: Generating"}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="rounded-lg border border-emerald-400/35 bg-emerald-500/10 px-3 py-2">
              <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Current Offer</p>
              <p className="font-mono text-xl font-bold text-emerald-300">${currentOffer.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {error ? (
          <p className="rounded-lg border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{error}</p>
        ) : null}

        <Card className="flex min-h-0 flex-1 flex-col rounded-xl border-slate-700/80 bg-slate-900/65 p-3 sm:p-4">
          <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}-${message.content.slice(0, 16)}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "border border-blue-400/35 bg-blue-600/95 text-white"
                        : "border border-slate-700 bg-slate-800/95 text-slate-200"
                    }`}
                  >
                    {message.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-slate-700 bg-slate-800/95 px-4 py-3 text-sm text-slate-300">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.22s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    <AsyncState
                      state={requestPhase}
                      labels={{
                        calling: "Calling model...",
                        thinking: "AI thinking...",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-3">
            {isComplete ? (
              <Button
                type="button"
                onClick={() => onComplete(messages, currentOffer, initialOffer || currentOffer)}
                className="w-full rounded-xl bg-emerald-600 py-6 text-base font-semibold text-white hover:bg-emerald-500"
              >
                View Negotiation Report
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Make your argument..."
                  className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/55 focus:outline-none"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="h-[46px] rounded-xl bg-blue-600 px-4 text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
