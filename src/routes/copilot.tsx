import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUp, Bot, Sparkles, User } from "lucide-react";
import { DemoTag, PageHeader, PanelHeader, SeverityBadge } from "@/components/kit/primitives";
import { cityContext, copilotAnswers, copilotSuggestions, fallbackAnswer } from "@/mock/copilot";
import { useStore } from "@/state/store";
import { cn } from "@/lib/utils";
import type { CopilotAnswer } from "@/lib/types";

export const Route = createFileRoute("/copilot")({
  head: () => ({
    meta: [
      { title: "AI City Copilot — UrbanSense AI" },
      {
        name: "description",
        content:
          "Ask the city: urgent repairs, route delays, pedestrian risk, repeated pothole detections and congestion trends, answered over fused fleet intelligence.",
      },
      { property: "og:title", content: "AI City Copilot — UrbanSense AI" },
      { property: "og:description", content: "Natural-language reasoning over every sensing layer." },
    ],
  }),
  component: CopilotPage,
});

interface Turn {
  id: string;
  role: "user" | "ai";
  text: string;
  answer?: CopilotAnswer;
}

function match(q: string): CopilotAnswer {
  const norm = q.toLowerCase();
  const direct = copilotAnswers.find((a) => a.question.toLowerCase() === norm);
  if (direct) return direct;
  const scored = copilotAnswers
    .map((a) => {
      const words = a.question.toLowerCase().replace(/[?.,]/g, "").split(" ");
      return { a, score: words.filter((w) => w.length > 3 && norm.includes(w)).length };
    })
    .sort((x, y) => y.score - x.score)[0];
  return scored && scored.score >= 2 ? scored.a : fallbackAnswer;
}

function CopilotPage() {
  const { selectRoad } = useStore();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const timer = useRef<number | null>(null);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question || thinking) return;
    setInput("");
    setTurns((t) => [...t, { id: `u-${Date.now()}`, role: "user", text: question }]);
    setThinking(true);
    timer.current = window.setTimeout(() => {
      const answer = match(question);
      setTurns((t) => [...t, { id: `a-${Date.now()}`, role: "ai", text: answer.answer, answer }]);
      setThinking(false);
    }, 900);
  };

  const empty = turns.length === 0;
  const suggestions = useMemo(() => copilotSuggestions, []);

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        eyebrow="natural-language intelligence"
        title="AI City Copilot"
        subtitle="Ask questions across fleet perception, road health, traffic, safety and infrastructure. Answers in this build are simulated."
        right={<DemoTag />}
      />

      <div className="grid flex-1 gap-3 p-5 xl:grid-cols-[1fr_320px]">
        <div className="panel flex min-h-[520px] flex-col">
          <PanelHeader
            title="copilot session"
            subtitle="Simulated reasoning over demo data"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            right={
              turns.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setTurns([])}
                  className="rounded-sm border border-border px-2 py-1 font-mono text-[10px] tracking-[0.12em] uppercase text-muted-foreground hover:text-foreground"
                >
                  clear
                </button>
              ) : undefined
            }
          />

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {empty && (
              <div className="mx-auto max-w-xl py-8 text-center">
                <Bot className="mx-auto h-8 w-8 text-intel" />
                <h2 className="mt-3 text-lg font-semibold tracking-tight uppercase">Ask the city</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every answer is grounded in fleet observations, fused events and road health scoring.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => ask(s)}
                      className="rounded-sm border border-border bg-panel-raised/40 px-3 py-2 text-left text-[12px] transition-colors hover:border-intel/50 hover:text-intel"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {turns.map((t) => (
              <div key={t.id} className={cn("flex gap-3", t.role === "user" && "justify-end")}>
                {t.role === "ai" && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-intel/40 bg-intel/10 text-intel">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-sm border px-4 py-3 text-[13px] whitespace-pre-line",
                    t.role === "user"
                      ? "border-border bg-panel-raised/60"
                      : "border-intel/30 bg-intel/[0.06]",
                  )}
                >
                  {t.text}
                  {t.answer && t.answer.cards.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {t.answer.cards.map((c) => (
                        <span
                          key={c.label}
                          className="rounded-sm border border-border bg-background/60 px-2.5 py-1.5"
                        >
                          <span className="label-mono block">{c.label}</span>
                          <span className="metric mt-0.5 block text-[12px]">{c.value}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {t.answer?.focusRoadId && (
                    <Link
                      to="/roads"
                      onClick={() => selectRoad(t.answer!.focusRoadId!)}
                      className="mt-3 inline-flex rounded-sm border border-intel/50 bg-intel/15 px-3 py-1.5 font-mono text-[10px] tracking-[0.12em] text-intel uppercase transition-colors hover:bg-intel/25"
                    >
                      show on road intelligence
                    </Link>
                  )}
                </div>
                {t.role === "user" && (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-panel-raised">
                    <User className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            ))}

            {thinking && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Bot className="h-3.5 w-3.5 text-intel" />
                <span className="animate-blink">reasoning over 6 intelligence layers…</span>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about repairs, delays, safety, congestion…"
              className="h-10 flex-1 rounded-sm border border-border bg-background/70 px-3 text-[13px] outline-none focus:border-intel/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-intel/50 bg-intel/15 text-intel transition-colors hover:bg-intel/25 disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-3">
          <div className="panel">
            <PanelHeader title="city context" subtitle="Grounding snapshot" />
            <div className="divide-y divide-border">
              {cityContext.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-2 px-4 py-2">
                  <span className="text-[12px] text-muted-foreground">{c.label}</span>
                  <span className="metric text-[12px]">{c.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <PanelHeader title="suggested questions" />
            <div className="space-y-2 p-3">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="w-full rounded-sm border border-border bg-panel-raised/40 px-3 py-2 text-left text-[12px] transition-colors hover:border-intel/50 hover:text-intel"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="panel px-4 py-3">
            <SeverityBadge sev="intel">simulated responses</SeverityBadge>
            <p className="mt-2 text-[11px] text-muted-foreground">
              This copilot answers from a curated demo knowledge set. A live model can be connected later without any
              interface changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
