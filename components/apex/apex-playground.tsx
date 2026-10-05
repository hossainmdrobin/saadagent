"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Braces,
  CircleCheck,
  Loader,
  Play,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";
import { SectionHeading } from "@/components/apex/brand";
import { Reveal, SpotlightCard } from "@/components/apex/motion-primitives";
import { EASE_OUT } from "@/lib/apex/styles";

type LogKind = "cmd" | "meta" | "ok" | "write" | "warn" | "dim" | "accent";

type LogLine = {
  kind: LogKind;
  text: string;
};

type Scenario = {
  id: string;
  label: string;
  prompt: string;
  icon: typeof Braces;
  accent: "sky" | "violet" | "amber";
  estimate: string;
  duration: number;
  log: LogLine[];
  patch: { file: string; added: number; removed: number; lines: string[] };
};

const SCENARIOS: Scenario[] = [
  {
    id: "auth",
    label: "Create Next.js Auth Flow",
    prompt: "Create a Next.js auth flow with credentials login, hashed passwords, and revocable HTTP-only sessions.",
    icon: Braces,
    accent: "sky",
    estimate: "6 files",
    duration: 5600,
    log: [
      { kind: "cmd", text: "apex run \"create nextjs auth flow with credentials + revocable sessions\"" },
      { kind: "meta", text: "◇ plan · 4 steps" },
      { kind: "dim", text: "  1 read existing auth surface · 2 scaffold route handlers" },
      { kind: "dim", text: "  3 derive session model from user schema · 4 verify" },
      { kind: "write", text: "▸ writing  app/(auth)/login/page.tsx" },
      { kind: "write", text: "▸ writing  app/api/auth/login/route.ts" },
      { kind: "write", text: "▸ writing  lib/auth/session.ts" },
      { kind: "write", text: "▸ writing  lib/auth/password.ts" },
      { kind: "ok", text: "✓ mongoose model inferred from lib/db/user.ts" },
      { kind: "ok", text: "✓ 24 tests generated and passing" },
      { kind: "accent", text: "◆ ready · branch apex/auth-flow · 4 files changed" },
    ],
    patch: {
      file: "app/api/auth/login/route.ts",
      added: 31,
      removed: 0,
      lines: [
        "export async function POST(req: Request) {",
        "  const body = await req.json();",
        "  const user = await User.findOne({",
        "    email: body.email.toLowerCase(),",
        "  });",
        "  if (!user) return unauthorized();",
        "",
        "  const match = await verifyPassword(",
        "    body.password,",
        "    user.passwordHash,",
        "  );",
        "  if (!match) return unauthorized();",
        "",
        "  const token = await createSession(user.id);",
        "  const res = NextResponse.json({ ok: true });",
        "  res.cookies.set(SESSION_COOKIE, token, {",
        "    httpOnly: true,",
        "    sameSite: \"lax\",",
        "    secure: process.env.NODE_ENV !== \"development\",",
        "    maxAge: SESSION_TTL,",
        "    path: \"/\",",
        "  });",
        "  return res;",
        "}",
      ],
    },
  },
  {
    id: "leak",
    label: "Fix Memory Leak",
    prompt: "Track down the memory leak in the dashboard charts and fix the interval cleanup.",
    icon: TriangleAlert,
    accent: "amber",
    estimate: "3 files",
    duration: 6200,
    log: [
      { kind: "cmd", text: "apex run \"find and fix the memory leak in dashboard charts\"" },
      { kind: "warn", text: "✗ runtime heap snapshot grew 340MB over 12min" },
      { kind: "meta", text: "◇ plan · 3 steps" },
      { kind: "dim", text: "  1 profile allocations · 2 patch cleanup · 3 soak test" },
      { kind: "dim", text: "  ⟶ culprit: hooks/useInterval.ts — interval never cleared" },
      { kind: "write", text: "▸ writing  hooks/useInterval.ts" },
      { kind: "write", text: "▸ writing  components/Chart.tsx" },
      { kind: "ok", text: "✓ soak test · heap stable at 84MB for 10min" },
      { kind: "ok", text: "✓ 11 tests passing · 2 added for cleanup paths" },
      { kind: "accent", text: "◆ ready · leak closed · +23 −9" },
    ],
    patch: {
      file: "hooks/useInterval.ts",
      added: 14,
      removed: 5,
      lines: [
        "export function useInterval(",
        "  callback: () => void,",
        "  delay: number | null,",
        ") {",
        "  const saved = useRef(callback);",
        "",
        "  useEffect(() => {",
        "    saved.current = callback;",
        "  }, [callback]);",
        "",
        "  useEffect(() => {",
        "    if (delay === null) return;",
        "    const id = setInterval(() => {",
        "      saved.current();",
        "    }, delay);",
        "    return () => clearInterval(id);   // ← added",
        "  }, [delay]);",
        "}",
      ],
    },
  },
  {
    id: "parallax",
    label: "Build Parallax Landing Page",
    prompt: "Build a dark parallax landing page with scroll-linked layers and a glass navigation bar.",
    icon: Play,
    accent: "violet",
    estimate: "5 files",
    duration: 6000,
    log: [
      { kind: "cmd", text: "apex run \"build a dark parallax landing page with layered scroll\"" },
      { kind: "meta", text: "◇ plan · 5 steps" },
      { kind: "dim", text: "  1 read design tokens · 2 scaffold sections · 3 wire scroll" },
      { kind: "dim", text: "  4 add reduced-motion fallback · 5 a11y + lighthouse pass" },
      { kind: "write", text: "▸ writing  components/Hero.tsx" },
      { kind: "write", text: "▸ writing  components/Nav.tsx" },
      { kind: "write", text: "▸ writing  components/GradientText.tsx" },
      { kind: "ok", text: "✓ motion respects prefers-reduced-motion" },
      { kind: "ok", text: "✓ contrast 7.2:1 · lighthouse perf 98" },
      { kind: "accent", text: "◆ ready · preview on :3000 · 5 files changed" },
    ],
    patch: {
      file: "components/Hero.tsx",
      added: 47,
      removed: 0,
      lines: [
        "\"use client\";",
        "",
        "export function Hero() {",
        "  const ref = useRef<HTMLElement>(null);",
        "  const { scrollYProgress } = useScroll({",
        "    target: ref,",
        "    offset: [\"start start\", \"end start\"],",
        "  });",
        "  const y = useTransform(scrollYProgress,",
        "    [0, 1], [\"0%\", \"18%\"]);",
        "",
        "  return (",
        "    <section ref={ref} className=\"relative isolate\">",
        "      <motion.div",
        "        style={{ y }}",
        "        className=\"-z-10 opacity-70\"",
        "      >",
        "        <GlowMesh />",
        "      </motion.div>",
        "      <h1>Build at the speed of thought</h1>",
        "    </section>",
        "  );",
        "}",
      ],
    },
  },
];

const KIND_TEXT: Record<LogKind, string> = {
  cmd: "text-zinc-100",
  meta: "text-sky-300",
  ok: "text-emerald-400",
  write: "text-zinc-400",
  warn: "text-amber-300",
  dim: "text-zinc-600",
  accent: "text-violet-300",
};

const ACCENT_RING: Record<Scenario["accent"], string> = {
  sky: "border-sky-400/35 bg-sky-400/8",
  violet: "border-violet-400/35 bg-violet-400/8",
  amber: "border-amber-300/35 bg-amber-300/8",
};

const ACCENT_TEXT: Record<Scenario["accent"], string> = {
  sky: "text-sky-300",
  violet: "text-violet-300",
  amber: "text-amber-300",
};

const STATUS = [
  { key: "queued", label: "queued", tone: "text-zinc-500" },
  { key: "planning", label: "planning", tone: "text-sky-300" },
  { key: "executing", label: "executing", tone: "text-violet-300" },
  { key: "verifying", label: "verifying", tone: "text-amber-300" },
  { key: "done", label: "complete", tone: "text-emerald-400" },
] as const;

function PromptPicker({
  selected,
  onSelect,
  disabled,
}: {
  selected: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {SCENARIOS.map((scenario) => {
        const Icon = scenario.icon;
        const isActive = scenario.id === selected;
        return (
          <li key={scenario.id}>
            <button
              type="button"
              onClick={() => onSelect(scenario.id)}
              disabled={disabled}
              aria-pressed={isActive}
              className={`group relative flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${
                isActive
                  ? "border-white/14 bg-obsidian-raised/70"
                  : "border-white/8 bg-white/[0.02] hover:border-white/14 hover:bg-white/[0.04]"
              }`}
            >
              <span
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300 ${
                  isActive ? ACCENT_RING[scenario.accent] : "border-white/8 bg-black/30"
                }`}
              >
                <Icon
                  className={`size-4 transition-colors duration-300 ${
                    isActive ? ACCENT_TEXT[scenario.accent] : "text-zinc-500"
                  }`}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive ? "text-zinc-50" : "text-zinc-300"
                    }`}
                  >
                    {scenario.label}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                    {scenario.estimate}
                  </span>
                </span>
                <span className="mt-1 block font-mono text-[10.5px] leading-relaxed text-zinc-600">
                  {scenario.prompt}
                </span>
              </span>
              {isActive ? (
                <motion.span
                  layoutId="prompt-marker"
                  className="absolute -top-px bottom-px -left-px w-0.5 rounded-full bg-linear-to-b from-sky-400 to-violet-400"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ApexPlayground() {
  const [selectedId, setSelectedId] = useState(SCENARIOS[0].id);
  const [runToken, setRunToken] = useState(0);
  const [visible, setVisible] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  const scenario = SCENARIOS.find((entry) => entry.id === selectedId) ?? SCENARIOS[0];
  const running = visible < scenario.log.length;
  const done = !running && visible > 0;
  const progress = Math.min(100, (visible / scenario.log.length) * 100);

  const startRun = useCallback((id: string) => {
    setSelectedId(id);
    setVisible(0);
    setElapsed(0);
    setRunToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const perLine = scenario.duration / scenario.log.length;
    const timers: number[] = [];

    for (let index = 1; index <= scenario.log.length; index += 1) {
      timers.push(
        window.setTimeout(() => setVisible(index), Math.round(index * perLine)),
      );
    }

    const clock = window.setInterval(() => {
      setElapsed((value) => Math.min(scenario.duration, value + 100));
    }, 100);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearInterval(clock);
    };
  }, [runToken, scenario]);

  useEffect(() => {
    const node = logRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [visible]);

  const statusIndex = done
    ? STATUS.length - 1
    : Math.min(3, Math.floor((visible / scenario.log.length) * 4));

  return (
    <section id="playground" className="relative scroll-mt-24 overflow-hidden py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 -z-20 size-[42rem] -translate-x-1/2 rounded-full bg-sky-500/10 blur-[150px]"
      />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Playground"
            title={
              <>
                Watch the agent
                <span className="apex-text-gradient"> work in real time</span>
              </>
            }
            description="Pick a task. The agent plans it, executes it against your workspace, and streams back the terminal log and the diff it produced."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <Reveal delay={0.06}>
            <SpotlightCard className="h-full rounded-3xl border border-white/8 bg-obsidian-raised/30 p-5 backdrop-blur-md">
              <p className="font-mono text-[11px] tracking-[0.18em] text-zinc-600 uppercase">
                sample prompts
              </p>
              <div className="mt-4">
                <PromptPicker
                  selected={selectedId}
                  onSelect={startRun}
                  disabled={running}
                />
              </div>
              <button
                type="button"
                onClick={() => startRun(selectedId)}
                className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2.5 text-sm font-medium text-sky-100 transition-colors duration-300 hover:border-sky-300/60 hover:bg-sky-400/18"
              >
                <RefreshCw className="size-3.5 transition-transform duration-500 group-hover:rotate-180" />
                {done ? "Run again" : running ? "Running…" : "Run this prompt"}
              </button>
            </SpotlightCard>
          </Reveal>

          <Reveal delay={0.12}>
            <SpotlightCard
              tone="violet"
              className="relative h-full overflow-hidden rounded-3xl border border-white/8 bg-obsidian-sunken/80 backdrop-blur-md"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px apex-hairline" />

              <div className="flex flex-wrap items-center gap-3 border-b border-white/8 px-4 py-3 sm:px-5">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
                  <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
                  <span className="size-2.5 rounded-full bg-[#28c840]/80" />
                </span>
                <span className="rounded-md border border-white/8 bg-black/40 px-2.5 py-1 font-mono text-[10px] text-zinc-400">
                  apex-agent · workspace
                </span>
                <span className="ml-auto flex items-center gap-2.5">
                  <span
                    className={`inline-flex items-center gap-1.5 font-mono text-[10px] ${
                      running ? STATUS[statusIndex].tone : STATUS[4].tone
                    }`}
                  >
                    {running ? (
                      <Loader className="size-3 animate-spin" />
                    ) : (
                      <CircleCheck className="size-3" />
                    )}
                    {running ? STATUS[statusIndex].label : STATUS[4].label}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600 tabular-nums">
                    {(elapsed / 1000).toFixed(1)}s
                  </span>
                </span>
              </div>

              <div className="h-1 w-full bg-white/6">
                <motion.div
                  className="h-full bg-linear-to-r from-sky-400 via-violet-400 to-emerald-400"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                />
              </div>

              <div className="grid gap-px bg-white/6 lg:grid-cols-2">
                <div className="bg-obsidian-sunken/95 p-4 sm:p-5">
                  <p className="mb-3 font-mono text-[10px] tracking-[0.18em] text-zinc-600 uppercase">
                    terminal
                  </p>
                  <div
                    ref={logRef}
                    aria-hidden
                    className="apex-scrollbar-none h-64 overflow-y-auto font-mono text-[11px] leading-6 sm:h-72"
                  >
                    {scenario.log.slice(0, visible).map((line, index) => (
                      <motion.p
                        key={`${runToken}-${index}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.28, ease: EASE_OUT }}
                        className={KIND_TEXT[line.kind]}
                      >
                        {line.text}
                      </motion.p>
                    ))}
                    {running ? (
                      <p className="text-zinc-600">
                        <span className="ml-0.5 inline-block h-3 w-1.5 animate-caret bg-sky-400 align-middle" />
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="bg-obsidian-sunken/95 p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-zinc-600 uppercase">
                      diff
                    </p>
                    <p className="font-mono text-[10px]">
                      <span className="text-emerald-400">+{scenario.patch.added}</span>{" "}
                      <span className="text-rose-400">−{scenario.patch.removed}</span>
                    </p>
                  </div>
                  <p className="truncate font-mono text-[10.5px] text-zinc-500">
                    {scenario.patch.file}
                  </p>
                  <div className="apex-scrollbar-none mt-2 h-56 overflow-y-auto font-mono text-[10.5px] leading-[1.8] sm:h-64">
                    {scenario.patch.lines
                      .slice(
                        0,
                        Math.max(
                          1,
                          Math.ceil(
                            (visible / scenario.log.length) * scenario.patch.lines.length,
                          ),
                        ),
                      )
                      .map((line, index) => {
                        const added = line.trimStart().startsWith("←");
                        return (
                          <motion.div
                            key={`${runToken}-${index}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: EASE_OUT }}
                            className={`flex gap-2.5 rounded-sm px-1 ${
                              added ? "bg-emerald-400/[0.07]" : ""
                            }`}
                          >
                            <span className="w-5 shrink-0 select-none text-right text-zinc-700">
                              {index + 1}
                            </span>
                            <span
                              className={`min-w-0 break-words whitespace-pre-wrap ${
                                added ? "text-emerald-100/90" : "text-zinc-500"
                              }`}
                            >
                              {line}
                            </span>
                          </motion.div>
                        );
                      })}
                    {done ? (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex items-center gap-1.5 pl-6 font-mono text-[10px] text-emerald-400"
                      >
                        <CircleCheck className="size-3" />
                        diff applied · ready to review
                      </motion.p>
                    ) : null}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}