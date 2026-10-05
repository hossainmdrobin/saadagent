export type StatEntry = {
  label: string;
  value: number;
  suffix: string;
  decimals: number;
  detail: string;
  tone: "sky" | "violet";
};

export const HERO_STATS: StatEntry[] = [
  {
    label: "Delivery speedup",
    value: 10,
    suffix: "×",
    decimals: 0,
    detail: "median across 4,100 shipped repos",
    tone: "sky",
  },
  {
    label: "Syntax accuracy",
    value: 99.4,
    suffix: "%",
    decimals: 1,
    detail: "measured on first-pass execution",
    tone: "violet",
  },
  {
    label: "Configuration required",
    value: 0,
    suffix: "",
    decimals: 0,
    detail: "drop the binary in, point at a folder",
    tone: "sky",
  },
  {
    label: "Tasks executed",
    value: 1.2,
    suffix: "M",
    decimals: 1,
    detail: "across 38,000 connected workspaces",
    tone: "violet",
  },
];

export type ScriptTone = "cmd" | "meta" | "ok" | "write" | "dim" | "warn" | "accent";

export type ScriptSegment = { text: string; tone: ScriptTone };

export type ScriptLine = {
  text: string;
  /** Default colouring, used when `segments` is omitted. */
  tone?: ScriptTone;
  /** Optional per-run colouring; must concatenate to `text`. */
  segments?: ScriptSegment[];
  /** Milliseconds between individual characters. */
  charMs?: number;
  /** Milliseconds of silence after the line finishes. */
  pauseMs?: number;
};

const writeLine = (file: string): ScriptLine => ({
  text: `▸ writing  ${file}`,
  segments: [
    { text: "▸ writing  ", tone: "dim" },
    { text: file, tone: "write" },
  ],
  charMs: 9,
  pauseMs: 150,
});

export const HERO_TERMINAL: ScriptLine[] = [
  { text: "apex init --stack nextjs --deploy edge", tone: "cmd", charMs: 22, pauseMs: 260 },
  { text: "✓ workspace indexed · 1,284 files · 38,921 symbols", tone: "ok", charMs: 8, pauseMs: 200 },
  { text: "◇ plan · 6 tasks · est 42s", tone: "meta", charMs: 12, pauseMs: 220 },
  { text: "  ├ 1  scaffold app router + strict tsconfig", tone: "dim", charMs: 8, pauseMs: 90 },
  { text: "  ├ 2  generate credential + oauth sessions", tone: "dim", charMs: 8, pauseMs: 90 },
  { text: "  ├ 3  wire mongoose models + indexes", tone: "dim", charMs: 8, pauseMs: 90 },
  { text: "  ├ 4  attach rtk query cache layer", tone: "dim", charMs: 8, pauseMs: 90 },
  { text: "  └ 5  typecheck → lint → build", tone: "dim", charMs: 8, pauseMs: 240 },
  writeLine("app/(auth)/login/page.tsx"),
  writeLine("app/api/auth/login/route.ts"),
  writeLine("lib/auth/session.ts"),
  writeLine("store/api.ts"),
  writeLine("components/providers/toast.tsx"),
  { text: "✓ typecheck · 0 errors", tone: "ok", charMs: 14, pauseMs: 130 },
  { text: "✓ tests · 24 passed · 0 skipped", tone: "ok", charMs: 14, pauseMs: 130 },
  { text: "✓ build · 1.9s · 42 routes", tone: "ok", charMs: 14, pauseMs: 240 },
  { text: "◆ deploy ready → apex-agent.edge.run", tone: "accent", charMs: 16, pauseMs: 400 },
];

export const TONE_TEXT: Record<ScriptTone, string> = {
  cmd: "text-zinc-100",
  meta: "text-sky-300",
  ok: "text-emerald-400",
  write: "text-violet-300",
  dim: "text-zinc-500",
  warn: "text-amber-300",
  accent: "text-sky-300",
};

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  metric: string;
};

export const TESTIMONIALS_ROW_A: Testimonial[] = [
  {
    quote:
      "We handed ApexCode a legacy Rails billing service and a Next.js storefront. It read both, mapped the contract, and shipped the migration in a single session.",
    name: "Inez Okafor",
    role: "Staff Engineer · Northwind",
    initials: "IO",
    metric: "11 days → 4 hrs",
  },
  {
    quote:
      "The self-healing build loop is the thing nobody else ships. It catches its own type errors and keeps going instead of parking on a red build.",
    name: "Tomas Rehn",
    role: "Principal · Tessellate",
    initials: "TR",
    metric: "0 red builds",
  },
  {
    quote:
      "Repository context is real. It understood our internal design-system conventions and stopped me from hand-writing wrappers again.",
    name: "Mei-Lin Chao",
    role: "Frontend Lead · Kestrel",
    initials: "MC",
    metric: "−38% boilerplate",
  },
  {
    quote:
      "Onboarding went from three weeks of tribal knowledge to a prompt. New engineers ship on day two now.",
    name: "Dev Ramanathan",
    role: "Director of Eng · Vantage",
    initials: "DR",
    metric: "3 wks → 2 days",
  },
];

export const TESTIMONIALS_ROW_B: Testimonial[] = [
  {
    quote:
      "I stopped reviewing diffs line by line and started reviewing intent. The plan it prints before touching anything is genuinely useful.",
    name: "Sofia Bianchi",
    role: "Tech Lead · Lumen Labs",
    initials: "SB",
    metric: "Review time −62%",
  },
  {
    quote:
      "It runs on our monorepo without choking. 900 packages, generated clients, GraphQL codegen — it holds the whole graph in context.",
    name: "Jonah Weiss",
    role: "Platform · Halcyon",
    initials: "JW",
    metric: "900 pkgs indexed",
  },
  {
    quote:
      "We wired it into CI as a first responder. It fixes failing PRs before a human even opens the tab.",
    name: "Amara Diallo",
    role: "SRE · Corvus",
    initials: "AD",
    metric: "−71% CI failures",
  },
  {
    quote:
      "Zero config was not marketing copy. Cloned the repo, ran one command, watched it install its own dependencies.",
    name: "Petr Novák",
    role: "Founder · Stakeline",
    initials: "PN",
    metric: "90s to first run",
  },
];

export type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthly: number | null;
  yearly: number | null;
  cta: string;
  featured?: boolean;
  note: string;
  features: { label: string; included: boolean }[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free Developer",
    tagline: "For solo builders proving the loop",
    monthly: 0,
    yearly: 0,
    cta: "Start Coding Free",
    note: "No card required. No time limit.",
    features: [
      { label: "Autonomous multi-file edits", included: true },
      { label: "Repository context · 25k symbols", included: true },
      { label: "Local terminal + IDE bridges", included: true },
      { label: "Self-healing build loop", included: true },
      { label: "40 agent tasks / day", included: true },
      { label: "Managed cloud sandboxes", included: false },
      { label: "CI auto-fix on pull requests", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro Engineer",
    tagline: "For shipping production systems daily",
    monthly: 29,
    yearly: 23,
    cta: "Deploy Agent Free",
    featured: true,
    note: "14-day trial · cancel in one click",
    features: [
      { label: "Autonomous multi-file edits", included: true },
      { label: "Repository context · unlimited", included: true },
      { label: "Managed cloud sandboxes", included: true },
      { label: "CI auto-fix on pull requests", included: true },
      { label: "1,000 agent tasks / day", included: true },
      { label: "Parallel agent lanes (×8)", included: true },
      { label: "Long-horizon memory across sessions", included: true },
    ],
  },
  {
    id: "fleet",
    name: "Enterprise Fleet",
    tagline: "For orgs that need governance and scale",
    monthly: null,
    yearly: null,
    cta: "Talk to Engineering",
    note: "Annual contract · volume seats",
    features: [
      { label: "Everything in Pro Engineer", included: true },
      { label: "Self-hosted or VPC deployment", included: true },
      { label: "Private model routing", included: true },
      { label: "SSO, SCIM & audit exports", included: true },
      { label: "Policy guardrails + data residency", included: true },
      { label: "Dedicated solutions engineer", included: true },
      { label: "99.99% uptime SLA", included: true },
    ],
  },
];

export const FOOTER_COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Product",
    links: ["Agent runtime", "Playground", "MCP connectors", "Changelog", "Roadmap"],
  },
  {
    title: "Developers",
    links: ["Documentation", "CLI reference", "Self-hosting guide", "Status", "Discord"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Press kit", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Security", "DPA", "Subprocessors"],
  },
];

export const TRUST_MARKS = [
  "NORTHWIND",
  "TESSELLATE",
  "KESTREL",
  "VANTAGE",
  "LUMEN",
  "HALCYON",
  "CORVUS",
  "STAKELINE",
];

export const CAPABILITIES = [
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "Ruby",
  "Elixir",
  "SQL",
  "Terraform",
  "Swift",
  "Kotlin",
  "Dart",
];