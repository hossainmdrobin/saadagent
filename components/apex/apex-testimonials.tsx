"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/apex/brand";
import {
  DriftLayer,
  Reveal,
  ScrollFieldProvider,
  SpotlightCard,
} from "@/components/apex/motion-primitives";
import { TESTIMONIALS_ROW_A, TESTIMONIALS_ROW_B, type Testimonial } from "@/lib/apex/content";

const PROOF = [
  { value: "38,000+", label: "connected workspaces" },
  { value: "112M", label: "agent tasks completed" },
  { value: "4.9 / 5", label: "developer rating" },
  { value: "SOC 2", label: "Type II certified" },
];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <SpotlightCard className="w-[19rem] shrink-0 sm:w-[22rem]">
      <div className="relative z-10 flex h-full flex-col gap-4 rounded-2xl border border-white/8 bg-obsidian-raised/45 p-5 backdrop-blur-md transition-colors duration-300 hover:border-white/14">
        <Quote className="size-4 text-sky-400/70" />
        <p className="flex-1 text-sm leading-relaxed text-pretty text-zinc-300">
          {item.quote}
        </p>
        <div className="flex items-center justify-between gap-3 border-t border-white/8 pt-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-linear-to-br from-sky-400/25 to-violet-400/25 font-mono text-[10px] text-zinc-100">
              {item.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-zinc-200">
                {item.name}
              </span>
              <span className="block truncate text-[10px] text-zinc-600">
                {item.role}
              </span>
            </span>
          </div>
          <span className="shrink-0 rounded-lg border border-sky-400/20 bg-sky-400/8 px-2 py-1 font-mono text-[9.5px] whitespace-nowrap text-sky-300">
            {item.metric}
          </span>
        </div>
      </div>
    </SpotlightCard>
  );
}

function MarqueeRow({
  items,
  reverse,
  drift,
  speed = 0.9,
}: {
  items: Testimonial[];
  reverse?: boolean;
  drift: number;
  speed?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8 }}
    >
      <DriftLayer
        from={drift}
        to={-drift}
        damping={30}
        className="group flex"
      >
        <div
          className={`flex shrink-0 gap-4 pr-4 ${
            reverse ? "animate-marquee-right" : "animate-marquee-left"
          }`}
          style={{ animationDuration: `${46 * speed}s` }}
        >
          {[...items, ...items].map((item, index) => (
            <TestimonialCard key={`${item.name}-${index}`} item={item} />
          ))}
        </div>
      </DriftLayer>
    </motion.div>
  );
}

export function ApexTestimonials() {
  return (
    <section
      id="community"
      className="relative scroll-mt-24 overflow-hidden py-20 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-obsidian to-transparent sm:w-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-obsidian to-transparent sm:w-40"
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            tone="violet"
            eyebrow="Community"
            title={
              <>
                Developers stopped writing boilerplate,
                <span className="apex-text-gradient"> then started shipping</span>
              </>
            }
            description="The pattern is always the same: describe the outcome, review the diff, merge before lunch."
          />
        </Reveal>
      </div>

      <ScrollFieldProvider className="mt-14 flex flex-col gap-4">
        <MarqueeRow items={TESTIMONIALS_ROW_A} drift={-30} speed={1} />
        <MarqueeRow items={TESTIMONIALS_ROW_B} reverse drift={34} speed={1.18} />
      </ScrollFieldProvider>

      <div className="mx-auto mt-16 w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/6 lg:grid-cols-4">
            {PROOF.map((entry) => (
              <div key={entry.label} className="bg-obsidian px-5 py-7 text-center">
                <dt className="sr-only">{entry.label}</dt>
                <dd>
                  <span className="block text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
                    {entry.value}
                  </span>
                  <span className="mt-1.5 block text-[11px] text-zinc-500">
                    {entry.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}