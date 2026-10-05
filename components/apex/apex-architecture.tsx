"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Boxes, FileSearch, Rocket, Terminal, Waypoints } from "lucide-react";
import { SectionHeading } from "@/components/apex/brand";
import { Reveal } from "@/components/apex/motion-primitives";

const STAGES = [
  {
    id: "plan",
    step: "01",
    icon: Waypoints,
    title: "Plan",
    summary: "Decomposes the request into a task graph before writing a line.",
    detail: "Reads intent, ranks risk, and prints the change set so you can veto any step up front.",
  },
  {
    id: "retrieve",
    step: "02",
    icon: FileSearch,
    title: "Retrieve",
    summary: "Pulls only the symbols the task actually depends on.",
    detail: "A dependency-graph walk keeps the context window dense with relevant code instead of whole files.",
  },
  {
    id: "edit",
    step: "03",
    icon: Terminal,
    title: "Edit",
    summary: "Applies coordinated patches across the workspace.",
    detail: "Edits land through your existing git workflow — branch, diff, review, then commit when you say so.",
  },
  {
    id: "verify",
    step: "04",
    icon: Boxes,
    title: "Verify",
    summary: "Runs typecheck, lint, tests and build in a disposable sandbox.",
    detail: "Failures feed straight back into the loop, so the agent repairs its own output before it ever reaches you.",
  },
  {
    id: "ship",
    step: "05",
    icon: Rocket,
    title: "Ship",
    summary: "Opens the pull request with the reasoning attached.",
    detail: "Every commit carries the plan, the diff, and the verification log — ready for review, not archaeology.",
  },
];

export function ApexArchitecture() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 70%", "end 60%"],
  });
  const rail = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <section
      ref={sectionRef}
      id="architecture"
      className="relative scroll-mt-24 overflow-hidden py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-linear-to-b from-transparent via-violet-600/[0.06] to-transparent"
      />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              align="left"
              tone="violet"
              eyebrow="Architecture"
              title={
                <>
                  One loop, five stages,
                  <span className="apex-text-gradient"> zero hand-offs</span>
                </>
              }
              description="The agent does not wait for you between steps. Retrieve feeds edit, edit feeds verify, and verify loops back into edit until the workspace is green."
            />
            <div className="mt-8 rounded-2xl border border-white/8 bg-obsidian-raised/40 p-5 backdrop-blur-md">
              <AnimatePanel stage={STAGES[active]} />
            </div>
          </Reveal>

          <div className="relative">
            <div className="absolute top-2 bottom-2 left-0 hidden w-px bg-white/8 lg:block">
              <motion.span
                aria-hidden
                style={{ scaleY: rail }}
                className="block h-full w-full origin-top bg-linear-to-b from-sky-400 via-violet-400 to-transparent"
              />
            </div>
            <ol className="relative flex flex-col gap-3 lg:pl-14">
              {STAGES.map((stage, index) => {
                const Icon = stage.icon;
                const isActive = index === active;
                return (
                  <Reveal key={stage.id} delay={index * 0.07}>
                    <li>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onFocus={() => setActive(index)}
                        onClick={() => setActive(index)}
                        aria-pressed={isActive}
                        className={`group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors duration-300 ${
                          isActive
                            ? "border-white/14 bg-obsidian-raised/60"
                            : "border-transparent hover:border-white/8 hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="relative z-10 -mt-0.5 hidden lg:block">
                          <span
                            className={`flex size-11 items-center justify-center rounded-xl border transition-all duration-300 ${
                              isActive
                                ? "border-sky-400/40 bg-sky-400/12 text-sky-300 shadow-[0_0_26px_-6px_rgba(56,189,248,0.8)]"
                                : "border-white/10 bg-obsidian text-zinc-500"
                            }`}
                          >
                            <Icon className="size-5" />
                          </span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2.5">
                            <span className="font-mono text-[10px] text-zinc-600">
                              {stage.step}
                            </span>
                            <span
                              className={`text-base font-semibold tracking-tight transition-colors duration-300 ${
                                isActive ? "text-zinc-50" : "text-zinc-300"
                              }`}
                            >
                              {stage.title}
                            </span>
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
                            {stage.summary}
                          </span>
                        </span>
                        <span className="absolute -top-px right-4 h-px w-10 bg-linear-to-r from-transparent to-sky-400/60 opacity-0 transition-opacity duration-500 group-hover:opacity-100 lg:hidden" />
                      </button>
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatePanel({ stage }: { stage: (typeof STAGES)[number] }) {
  const Icon = stage.icon;
  return (
    <motion.div
      key={stage.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-violet-300" />
        <span className="font-mono text-[11px] text-zinc-400">
          stage {stage.step} · {stage.id}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{stage.detail}</p>
    </motion.div>
  );
}