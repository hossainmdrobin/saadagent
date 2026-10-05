"use client";

import { motion } from "framer-motion";
import { Braces, GitCommitVertical, Play, Rocket, Sparkles } from "lucide-react";
import { LiveTerminal } from "@/components/apex/terminal-window";
import {
  DriftLayer,
  ParallaxLayer,
  PointerFieldProvider,
  ScrollFieldProvider,
} from "@/components/apex/motion-primitives";
import { Eyebrow } from "@/components/apex/brand";
import { HERO_TERMINAL, TRUST_MARKS } from "@/lib/apex/content";
import { EASE_OUT, SHIMMER_BUTTON } from "@/lib/apex/styles";

const HEADLINE = ["Build", "Complex", "Software", "at", "the"];
const HEADLINE_ACCENT = ["Speed", "of", "Thought"];

const SNIPPET = [
  { n: "1", code: "export async function", tone: "text-violet-300" },
  { n: "2", code: "  createSession(user: User) {", tone: "text-zinc-300" },
  { n: "3", code: "    const token = sign(user.id)", tone: "text-zinc-300" },
  { n: "4", code: "    await store.set(token, user)", tone: "text-zinc-300" },
  { n: "5", code: "    return token", tone: "text-zinc-300" },
  { n: "6", code: "  }", tone: "text-zinc-300" },
];

const DIFF_ROWS = [
  { name: "session.ts", add: "+58", del: "−12" },
  { name: "login/route.ts", add: "+31", del: "−0" },
  { name: "store/api.ts", add: "+64", del: "−0" },
];

function FloatingSnippetCard() {
  return (
    <ParallaxLayer
      depth={1.55}
      tilt={7}
      className="pointer-events-none absolute -top-8 -left-6 z-20 hidden xl:block"
    >
      <div className="w-64 rounded-xl border border-white/10 bg-obsidian-raised/85 p-3 shadow-[0_28px_70px_-28px_rgba(2,6,23,1)] backdrop-blur-md">
        <div className="mb-2 flex items-center gap-2">
          <Braces className="size-3 text-sky-400" />
          <span className="font-mono text-[10px] text-zinc-500">lib/auth/session.ts</span>
        </div>
        <pre className="apex-scrollbar-none overflow-x-auto font-mono text-[10px] leading-[1.7]">
          {SNIPPET.map((row) => (
            <div key={row.n} className="flex gap-2">
              <span className="w-2 shrink-0 select-none text-zinc-700">{row.n}</span>
              <span className={row.tone}>
                {row.code}
                {row.n === "2" ? (
                  <span className="ml-0.5 inline-block h-2.5 w-1 translate-y-0.5 animate-caret bg-sky-400 align-middle" />
                ) : null}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </ParallaxLayer>
  );
}

function FloatingDiffCard() {
  return (
    <ParallaxLayer
      depth={-1.15}
      tilt={-5}
      className="pointer-events-none absolute top-1/4 -right-8 z-20 hidden xl:block"
    >
      <div className="w-56 rounded-xl border border-white/10 bg-obsidian-raised/85 p-3.5 shadow-[0_28px_70px_-28px_rgba(2,6,23,1)] backdrop-blur-md">
        <div className="mb-2.5 flex items-center gap-2">
          <GitCommitVertical className="size-3 text-violet-400" />
          <span className="font-mono text-[10px] text-zinc-500">5 files · 1 commit</span>
        </div>
        <ul className="space-y-1.5">
          {DIFF_ROWS.map((row, index) => (
            <motion.li
              key={row.name}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.4 + index * 0.35, duration: 0.5 }}
              className="flex items-center justify-between font-mono text-[10px]"
            >
              <span className="truncate text-zinc-400">{row.name}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="text-emerald-400">{row.add}</span>
                <span className="text-rose-400/80">{row.del}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 2.4, duration: 1.1, ease: "easeInOut" }}
            className="h-full rounded-full bg-linear-to-r from-sky-400 to-violet-400"
          />
        </div>
      </div>
    </ParallaxLayer>
  );
}

function FloatingStatusCard() {
  return (
    <ParallaxLayer
      depth={1.9}
      tilt={6}
      className="pointer-events-none absolute -bottom-7 left-4 z-20 hidden sm:block"
    >
      <div className="rounded-xl border border-white/10 bg-obsidian-raised/85 px-3.5 py-3 shadow-[0_28px_70px_-28px_rgba(2,6,23,1)] backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-6 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-pulse-ring" />
            <span className="size-2 rounded-full bg-emerald-400" />
          </span>
          <div>
            <p className="font-mono text-[10px] text-zinc-300">agent: build:pass</p>
            <p className="font-mono text-[10px] text-zinc-600">38,921 symbols in context</p>
          </div>
        </div>
      </div>
    </ParallaxLayer>
  );
}

function WorkspaceMockup() {
  return (
    <DriftLayer from={38} to={-30} damping={30} className="relative mx-auto w-full max-w-3xl">
      <ParallaxLayer depth={0.3} tilt={3.2}>
        <div className="relative">
          <div className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(56,189,248,0.18),transparent_70%)] blur-2xl" />
          <FloatingSnippetCard />
          <FloatingDiffCard />
          <LiveTerminal lines={HERO_TERMINAL} />
          <FloatingStatusCard />
        </div>
      </ParallaxLayer>
    </DriftLayer>
  );
}

function Rise({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

export function ApexHero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30 bg-obsidian [mask-image:radial-gradient(ellipse_75%_60%_at_50%_15%,black,transparent)]"
      >
        <div className="apex-mesh absolute inset-0 animate-grid-drift opacity-60" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-32 -z-20 size-[34rem] rounded-full bg-sky-500/18 blur-[120px] animate-aura"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 -z-20 size-[30rem] rounded-full bg-violet-600/18 blur-[130px] animate-aura-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-20 h-64 bg-linear-to-b from-transparent to-obsidian"
      />

      <PointerFieldProvider className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <ScrollFieldProvider offset={["start start", "end start"]}>
          <div className="flex flex-col items-center gap-7 text-center">
            <Rise>
              <Eyebrow>
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full rounded-full bg-sky-400 animate-pulse-ring" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-sky-400" />
                </span>
                Autonomous agent · runtime 4.2
              </Eyebrow>
            </Rise>

            <Rise delay={0.08}>
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-5xl lg:text-[4.25rem] lg:leading-[1.02]">
                {HEADLINE.map((word) => (
                  <span key={word} className="mr-[0.28em] inline-block">
                    {word}
                  </span>
                ))}
                <span className="apex-text-gradient">
                  {HEADLINE_ACCENT.map((word) => (
                    <span key={word} className="mr-[0.28em] inline-block last:mr-0">
                      {word}
                    </span>
                  ))}
                </span>
              </h1>
            </Rise>

            <Rise delay={0.16}>
              <p className="max-w-2xl text-base leading-relaxed text-pretty text-zinc-400 sm:text-lg">
                An autonomous AI coding agent that plans, writes, tests, and
                executes full-stack apps directly in your workspace.
              </p>
            </Rise>

            <Rise delay={0.24}>
              <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
                <a
                  href="/signup"
                  className={`group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-sky-400 to-violet-400 px-6 py-3 text-sm font-semibold text-obsidian shadow-[0_0_40px_-8px_rgba(56,189,248,0.85)] transition-all duration-300 hover:shadow-[0_0_56px_-6px_rgba(139,92,246,0.95)] sm:w-auto ${SHIMMER_BUTTON}`}
                >
                  <Rocket className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                  Deploy Agent Free
                </a>
                <a
                  href="#playground"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-200 backdrop-blur-md transition-all duration-300 hover:border-sky-400/40 hover:bg-white/[0.06] hover:text-zinc-50 sm:w-auto"
                >
                  <span className="relative inline-flex size-5 items-center justify-center rounded-full border border-sky-400/40 bg-sky-400/10">
                    <span className="absolute inset-0 rounded-full bg-sky-400/25 animate-pulse-ring" />
                    <Play className="size-2.5 translate-x-px fill-sky-300 text-sky-300" />
                  </span>
                  Watch Terminal Demo
                </a>
              </div>
            </Rise>

            <Rise delay={0.32}>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
                  <Sparkles className="size-3 text-sky-400" />
                  No credit card · 40 tasks/day free
                </span>
                <span className="hidden h-3 w-px bg-white/10 sm:block" />
                <span className="font-mono text-xs text-zinc-500">
                  npm i -g @apexcode/cli
                </span>
              </div>
            </Rise>
          </div>

          <div className="mt-14 lg:mt-20">
            <WorkspaceMockup />
          </div>
        </ScrollFieldProvider>
      </PointerFieldProvider>

      <div className="mx-auto mt-16 w-full max-w-7xl px-5 sm:px-8 lg:mt-24">
        <p className="text-center text-[11px] font-medium tracking-[0.22em] text-zinc-600 uppercase">
          Shipped by teams at
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {TRUST_MARKS.map((mark, index) => (
            <motion.span
              key={mark}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.5 }}
              className="font-mono text-[13px] font-medium tracking-[0.2em] text-zinc-600 transition-colors duration-300 hover:text-zinc-300"
            >
              {mark}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}