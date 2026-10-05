"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { RotateCw, Terminal } from "lucide-react";
import { TONE_TEXT, type ScriptLine, type ScriptTone } from "@/lib/apex/content";
import { EASE_OUT } from "@/lib/apex/styles";

/**
 * Turns a scripted terminal transcript into a flat schedule of delays — one
 * slot per character plus one silence slot per line — so playback advances with
 * a single timer and can be rewound by bumping the run counter.
 */
function buildSchedule(lines: ScriptLine[]) {
  const steps: number[] = [];
  for (const line of lines) {
    const charMs = line.charMs ?? 14;
    for (let index = 0; index < line.text.length; index += 1) {
      steps.push(charMs);
    }
    steps.push(line.pauseMs ?? 150);
  }
  return steps;
}

/** Characters revealed per line for a given step offset. */
function revealedPerLine(lines: ScriptLine[], step: number) {
  let budget = step;
  const revealed: number[] = [];
  for (const line of lines) {
    const cost = line.text.length + 1;
    if (budget >= cost) {
      revealed.push(line.text.length);
      budget -= cost;
      continue;
    }
    revealed.push(Math.max(0, budget));
    break;
  }
  return revealed;
}

/**
 * The opening command is pre-typed rather than animated, so the very first
 * paint (server or client) shows a real transcript instead of an empty panel.
 */
function initialStep(lines: ScriptLine[]) {
  const first = lines[0];
  return first ? first.text.length + 1 : 0;
}

export function useScriptPlayback(lines: ScriptLine[]) {
  const schedule = useMemo(() => buildSchedule(lines), [lines]);
  const [step, setStep] = useState(() => initialStep(lines));

  const done = step >= schedule.length;

  useEffect(() => {
    if (done) return;
    const timer = window.setTimeout(
      () => setStep((current) => current + 1),
      schedule[step],
    );
    return () => window.clearTimeout(timer);
  }, [done, schedule, step]);

  const restart = useCallback(() => setStep(initialStep(lines)), [lines]);
  const revealed = useMemo(() => revealedPerLine(lines, step), [lines, step]);

  return { revealed, done, restart };
}

/**
 * Renders the revealed prefix of one transcript line, honouring per-segment
 * colouring. Segments always concatenate to `text`, so each one is just a window
 * into the same character range the scheduler has already revealed.
 */
function LineGlyphs({ line, count }: { line: ScriptLine; count: number }) {
  const segments = line.segments ?? [
    { text: line.text, tone: (line.tone ?? "dim") as ScriptTone },
  ];

  const visible = segments
    .map((segment, index) => {
      const start = segments
        .slice(0, index)
        .reduce((total, earlier) => total + earlier.text.length, 0);
      return {
        tone: segment.tone,
        text: line.text.slice(
          start,
          Math.min(count, start + segment.text.length),
        ),
      };
    })
    .filter((segment) => segment.text.length > 0);

  return (
    <>
      {visible.map((segment, index) => (
        <span key={index} className={TONE_TEXT[segment.tone]}>
          {segment.text}
        </span>
      ))}
    </>
  );
}

export function TerminalChrome({
  title,
  children,
  meta,
  className = "",
}: {
  title: string;
  children: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-obsidian-sunken/90 shadow-[0_40px_120px_-40px_rgba(2,6,23,1)] backdrop-blur-xl ${className}`}
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-400/45 to-transparent" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 animate-scanline bg-linear-to-b from-transparent via-sky-400/[0.055] to-transparent"
      />
      <div className="flex items-center gap-3 border-b border-white/8 bg-white/[0.02] px-4 py-3">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="ml-1 inline-flex items-center gap-2 rounded-md border border-white/8 bg-black/40 px-2.5 py-1 font-mono text-[11px] text-zinc-400">
          <Terminal className="size-3 text-sky-400" />
          {title}
        </span>
        <span className="ml-auto flex items-center gap-2">{meta}</span>
      </div>
      {children}
    </div>
  );
}

export function LiveTerminal({
  lines,
  className = "",
  lineClassName = "",
}: {
  lines: ScriptLine[];
  className?: string;
  lineClassName?: string;
}) {
  const { revealed, done, restart } = useScriptPlayback(lines);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [revealed]);

  const lastVisible = revealed.reduce(
    (acc, count, index) => (count > 0 ? index : acc),
    0,
  );

  return (
    <TerminalChrome
      title="apex — zsh"
      meta={
        <>
          <span className="hidden rounded-md border border-white/8 bg-black/40 px-2 py-1 font-mono text-[10px] text-zinc-500 sm:inline">
            main ⌄
          </span>
          <button
            type="button"
            onClick={restart}
            aria-label="Replay terminal output"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/8 bg-black/40 px-2 py-1 font-mono text-[10px] text-zinc-400 transition-colors hover:border-sky-400/40 hover:text-sky-200"
          >
            <RotateCw className="size-3" />
            replay
          </button>
        </>
      }
    >
      <div
        ref={scrollRef}
        aria-hidden
        className={`apex-scrollbar-none relative h-[19rem] overflow-y-auto px-4 py-4 font-mono text-[12px] leading-6 sm:h-[21rem] sm:text-[12.5px] ${className}`}
      >
        <span className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-obsidian-sunken to-transparent" />
        {lines.map((line, index) => {
          const count = revealed[index];
          if (count === undefined) return null;
          return (
            <div key={index} className="flex gap-2.5 whitespace-pre">
              <span className="w-8 shrink-0 select-none text-right text-[10px] leading-6 text-zinc-700">
                {index + 1}
              </span>
              <p className={`min-w-0 ${lineClassName}`}>
                <LineGlyphs line={line} count={count} />
                {!done && index === lastVisible ? (
                  <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-caret bg-sky-400 align-middle" />
                ) : null}
              </p>
            </div>
          );
        })}
        {done ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="mt-2 pl-[2.5rem] font-mono text-[11px] text-zinc-600"
          >
            agent idle · awaiting next instruction_
          </motion.p>
        ) : null}
      </div>
      <p className="sr-only">
        ApexCode agent terminal replaying a run that indexes a workspace, plans
        six tasks, writes five files, then reports a clean typecheck, passing
        tests, a successful build, and a ready deployment.
      </p>
    </TerminalChrome>
  );
}