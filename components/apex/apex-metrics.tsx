"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue } from "framer-motion";
import { HERO_STATS, type StatEntry } from "@/lib/apex/content";
import {
  DriftLayer,
  ParallaxLayer,
  PointerFieldProvider,
  Reveal,
  ScrollFieldProvider,
} from "@/components/apex/motion-primitives";

const DEPTHS = [1.5, -1.1, 1.9, -1.6];
const BOB_DELAYS = [0, 1.4, 2.6, 3.8];

const TONES = {
  sky: {
    text: "text-sky-300",
    hoverRing: "hover:border-sky-400/40",
    hairline: "bg-sky-400/70",
  },
  violet: {
    text: "text-violet-300",
    hoverRing: "hover:border-violet-400/40",
    hairline: "bg-violet-400/70",
  },
} as const;

function useCountUp(target: number, decimals: number, active: boolean) {
  const value = useMotionValue(0);
  const [display, setDisplay] = useState((0).toFixed(decimals));

  useEffect(
    () =>
      value.on("change", (latest) => {
        setDisplay(latest.toFixed(decimals));
      }),
    [value, decimals],
  );

  useEffect(() => {
    if (!active) return;
    const controls = animate(value, target, {
      duration: 1.7,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [active, target, value]);

  return display;
}

function StatCard({
  stat,
  index,
  active,
}: {
  stat: StatEntry;
  index: number;
  active: boolean;
}) {
  const display = useCountUp(stat.value, stat.decimals, active);
  const tone = TONES[stat.tone];

  return (
    <ParallaxLayer depth={DEPTHS[index]} className="h-full">
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{
          duration: 7 + index,
          repeat: Infinity,
          ease: "easeInOut",
          delay: BOB_DELAYS[index],
        }}
        className={`group relative h-full rounded-2xl border border-white/8 bg-obsidian-raised/50 p-5 backdrop-blur-md transition-colors duration-300 hover:bg-obsidian-raised/80 ${tone.hoverRing}`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute -top-px right-6 h-px w-16 opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${tone.hairline}`}
        />
        <p className="flex items-baseline gap-0.5">
          {/*
            The animated readout starts at zero, so the settled figure is also
            exposed to assistive tech and crawlers as plain text.
          */}
          <span className="sr-only">
            {stat.value.toFixed(stat.decimals)}
            {stat.suffix}
          </span>
          <span aria-hidden className={tone.text}>
            <span className="text-4xl font-semibold tracking-tight tabular-nums sm:text-[2.6rem]">
              {display}
            </span>
            {stat.suffix ? (
              <span className="text-2xl font-semibold sm:text-3xl">{stat.suffix}</span>
            ) : null}
          </span>
        </p>
        <p className="mt-2 text-sm font-medium text-zinc-200">{stat.label}</p>
        <p className="mt-1 font-mono text-[11px] text-zinc-600">{stat.detail}</p>
      </motion.div>
    </ParallaxLayer>
  );
}

export function ApexMetrics() {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, margin: "-100px" });

  return (
    <section className="relative isolate overflow-hidden py-14 lg:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-linear-to-b from-transparent via-sky-500/[0.05] to-transparent"
      />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-zinc-600 uppercase">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-status-dot" />
              live capability metrics
            </span>
            <p className="max-w-xl text-sm text-zinc-500">
              Aggregated across every connected workspace, refreshed continuously.
            </p>
          </div>
        </Reveal>

        <ScrollFieldProvider className="mt-10">
          <PointerFieldProvider>
            <div
              ref={gridRef}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {HERO_STATS.map((stat, index) => (
                <DriftLayer
                  key={stat.label}
                  from={index % 2 === 0 ? 46 : 8}
                  to={index % 2 === 0 ? 8 : 46}
                  damping={30}
                >
                  <StatCard stat={stat} index={index} active={inView} />
                </DriftLayer>
              ))}
            </div>
          </PointerFieldProvider>
        </ScrollFieldProvider>
      </div>
    </section>
  );
}