"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Minus, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/apex/brand";
import { Reveal } from "@/components/apex/motion-primitives";
import { PLANS, type Plan } from "@/lib/apex/content";
import { SHIMMER_BUTTON } from "@/lib/apex/styles";

type Cycle = "monthly" | "yearly";

function PriceTag({ plan, cycle }: { plan: Plan; cycle: Cycle }) {
  const amount = cycle === "monthly" ? plan.monthly : plan.yearly;

  if (amount === null) {
    return (
      <p className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
        Custom
      </p>
    );
  }

  if (amount === 0) {
    return (
      <p className="flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
          $0
        </span>
        <span className="text-sm text-zinc-500">forever</span>
      </p>
    );
  }

  return (
    <p className="flex items-baseline gap-1">
      <span className="text-lg font-medium text-zinc-400">$</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`${plan.id}-${cycle}`}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-semibold tracking-tight text-zinc-50 tabular-nums sm:text-5xl"
        >
          {amount}
        </motion.span>
      </AnimatePresence>
      <span className="text-sm text-zinc-500">/mo</span>
    </p>
  );
}

function BillingToggle({
  cycle,
  onChange,
}: {
  cycle: Cycle;
  onChange: (next: Cycle) => void;
}) {
  return (
    <div className="inline-flex items-center gap-3">
      <div
        role="radiogroup"
        aria-label="Billing cycle"
        className="relative inline-flex items-center rounded-xl border border-white/10 bg-obsidian-raised/60 p-1 backdrop-blur-md"
      >
        {(["monthly", "yearly"] as const).map((option) => {
          const isActive = option === cycle;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option)}
              className={`relative rounded-lg px-4 py-2 text-sm transition-colors duration-200 ${
                isActive ? "text-obsidian" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {isActive ? (
                <motion.span
                  layoutId="billing-pill"
                  className="absolute inset-0 -z-10 rounded-lg bg-linear-to-r from-sky-300 to-violet-300 shadow-[0_0_20px_-4px_rgba(56,189,248,0.9)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="capitalize">{option}</span>
            </button>
          );
        })}
      </div>
      <motion.span
        animate={{ scale: cycle === "yearly" ? [1, 1.06, 1] : 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-mono text-[10px] whitespace-nowrap text-emerald-300"
      >
        save 20%
      </motion.span>
    </div>
  );
}

function PlanCard({ plan, cycle }: { plan: Plan; cycle: Cycle }) {
  const featured = Boolean(plan.featured);

  return (
    <div
      className={`relative flex h-full flex-col rounded-3xl p-6 backdrop-blur-md transition-colors duration-500 sm:p-7 ${
        featured
          ? "border border-sky-400/25 bg-obsidian-raised/70 shadow-[0_0_60px_-24px_rgba(56,189,248,0.7)]"
          : "border border-white/8 bg-obsidian-raised/30 hover:border-white/14"
      }`}
    >
      {featured ? (
        <>
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-sky-400 to-transparent" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-sky-400 to-violet-400 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-obsidian uppercase shadow-[0_0_24px_-4px_rgba(56,189,248,0.9)]">
            most popular
          </span>
        </>
      ) : null}

      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold tracking-tight text-zinc-50">
          {plan.name}
        </h3>
        {featured ? (
          <Sparkles className="size-3.5 text-sky-400" aria-hidden />
        ) : null}
      </div>
      <p className="mt-1.5 text-sm text-zinc-500">{plan.tagline}</p>

      <div className="mt-7">
        <PriceTag plan={plan} cycle={cycle} />
        <p className="mt-2 font-mono text-[11px] text-zinc-600">
          {cycle === "yearly" && plan.monthly !== null && plan.monthly > 0
            ? `billed annually · $${(plan.yearly ?? 0) * 12}/yr`
            : plan.note}
        </p>
      </div>

      <a
        href="/signup"
        className={`group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ${
          featured
            ? `bg-linear-to-r from-sky-400 to-violet-400 text-obsidian shadow-[0_0_34px_-10px_rgba(56,189,248,0.9)] hover:shadow-[0_0_46px_-8px_rgba(139,92,246,0.95)] ${SHIMMER_BUTTON}`
            : "border border-white/12 bg-white/[0.03] text-zinc-100 hover:border-sky-400/40 hover:bg-white/[0.06]"
        }`}
      >
        {plan.cta}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>

      <ul className="mt-7 flex flex-col gap-3 border-t border-white/8 pt-6">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className={`flex items-start gap-2.5 text-sm ${
              feature.included ? "text-zinc-300" : "text-zinc-600"
            }`}
          >
            {feature.included ? (
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10">
                <Check className="size-2.5 text-emerald-400" aria-hidden />
              </span>
            ) : (
              <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-md border border-white/8">
                <Minus className="size-2.5 text-zinc-600" aria-hidden />
              </span>
            )}
            <span>{feature.label}</span>
            <span className="sr-only">
              {feature.included ? " included" : " not included"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ApexPricing() {
  const [cycle, setCycle] = useState<Cycle>("yearly");

  return (
    <section id="pricing" className="relative scroll-mt-24 overflow-hidden py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -z-20 size-[40rem] -translate-x-1/2 rounded-full bg-violet-600/12 blur-[150px]"
      />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Pricing"
            title={
              <>
                Start free, ship when it
                <span className="apex-text-gradient"> matters</span>
              </>
            }
            description="Every tier runs the same agent runtime. You are only changing concurrency, context size, and where the work executes."
          />
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-9 flex justify-center">
            <BillingToggle cycle={cycle} onChange={setCycle} />
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.id} delay={index * 0.08}>
              <PlanCard plan={plan} cycle={cycle} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <p className="mt-10 text-center text-xs text-zinc-600">
            All prices in USD. Self-hosting is available on Fleet · usage-based
            overage billed at 8% of plan rate.
          </p>
        </Reveal>
      </div>
    </section>
  );
}