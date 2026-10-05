import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { ApexNav } from "@/components/apex/apex-nav";
import { ApexHero } from "@/components/apex/apex-hero";
import { ApexMetrics } from "@/components/apex/apex-metrics";
import { ApexFeatures } from "@/components/apex/apex-features";
import { ApexArchitecture } from "@/components/apex/apex-architecture";
import { ApexPlayground } from "@/components/apex/apex-playground";
import { ApexTestimonials } from "@/components/apex/apex-testimonials";
import { ApexPricing } from "@/components/apex/apex-pricing";
import { ApexFooter } from "@/components/apex/apex-footer";

export const metadata: Metadata = {
  title: "ApexCode AI — Build Complex Software at the Speed of Thought",
  description:
    "An autonomous AI coding agent that plans, writes, tests, and executes full-stack apps directly in your workspace.",
  openGraph: {
    title: "ApexCode AI — Build Complex Software at the Speed of Thought",
    description:
      "An autonomous AI coding agent that plans, writes, tests, and executes full-stack apps directly in your workspace.",
    type: "website",
  },
};

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen w-full overflow-x-clip bg-obsidian text-zinc-100 antialiased selection:bg-sky-400/25 selection:text-sky-100">
        <ApexNav />
        <main>
          <ApexHero />
          <ApexMetrics />
          <ApexFeatures />
          <ApexArchitecture />
          <ApexPlayground />
          <ApexTestimonials />
          <ApexPricing />
        </main>
        <ApexFooter />
      </div>
    </MotionConfig>
  );
}