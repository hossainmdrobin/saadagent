"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  FileCode,
  GitBranch,
  Network,
  Play,
  RefreshCw,
  ScanSearch,
  Wrench,
} from "lucide-react";
import { SectionHeading } from "@/components/apex/brand";
import { Reveal, SpotlightCard } from "@/components/apex/motion-primitives";
import { CAPABILITIES } from "@/lib/apex/content";
import { EASE_OUT } from "@/lib/apex/styles";

/* ------------------------------------------------------------------ */
/* Card 1 — Autonomous multi-file editing                              */
/* ------------------------------------------------------------------ */

type DiffLine = { sign: "+" | "-" | " "; code: string };

const DIFF_FILES: { name: string; added: number; removed: number; lines: DiffLine[] }[] = [
  {
    name: "app/(auth)/login/page.tsx",
    added: 42,
    removed: 3,
    lines: [
      { sign: " ", code: '"use client"' },
      { sign: "+", code: "import { signIn } from \"@/store/api\";" },
      { sign: " ", code: "" },
      { sign: "+", code: "export default function Login() {" },
      { sign: "+", code: "  const [error, setError] = useState<string>()" },
      { sign: "+", code: "  const onSubmit = async (e: FormEvent) => {" },
      { sign: "+", code: "    e.preventDefault();" },
      { sign: "+", code: "    const res = await signIn(form.get(e.currentTarget));" },
      { sign: "-", code: "    legacyManualFetch(e.target)" },
      { sign: "+", code: "    return res.ok ? router.push(\"/dashboard\")" },
      { sign: "+", code: "                            : setError(res.message);" },
      { sign: "+", code: "  };" },
    ],
  },
  {
    name: "app/api/auth/login/route.ts",
    added: 31,
    removed: 0,
    lines: [
      { sign: "+", code: "export async function POST(req: Request) {" },
      { sign: "+", code: "  const body = await req.json();" },
      { sign: "+", code: "  const user = await User.findOne({ email: body.email });" },
      { sign: "+", code: "  if (!user) return NextResponse.json({ error: \"bad\" }, { status: 401 });" },
      { sign: "+", code: "  const match = await bcrypt.compare(body.password, user.hash);" },
      { sign: "+", code: "  if (!match) return NextResponse.json({ error: \"bad\" }, { status: 401 });" },
      { sign: "+", code: "  const token = await createSession(user.id);" },
      { sign: "+", code: "  return NextResponse.json({ token });" },
      { sign: "+", code: "}" },
    ],
  },
  {
    name: "lib/auth/session.ts",
    added: 58,
    removed: 12,
    lines: [
      { sign: "+", code: "const SESSION_TTL = 60 * 60 * 24 * 30;" },
      { sign: "+", code: "export async function createSession(userId: string) {" },
      { sign: "+", code: "  const raw = randomUUID();" },
      { sign: "+", code: "  const token = createHash(\"sha256\").update(raw).digest(\"hex\");" },
      { sign: "-", code: "  db.sessions.insert({ token: raw, userId });" },
      { sign: "+", code: "  await db.sessions.insert({ token, hash: hash(raw), userId });" },
      { sign: "+", code: "  await db.sessions.expire(token, SESSION_TTL);" },
      { sign: "+", code: "  return raw;" },
      { sign: "+", code: "}" },
    ],
  },
];

function DiffPreview() {
  const [active, setActive] = useState(0);
  const file = DIFF_FILES[active];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/8 bg-obsidian-sunken/80">
      <div className="flex gap-1 overflow-x-auto border-b border-white/8 bg-white/[0.02] p-1.5 apex-scrollbar-none">
        {DIFF_FILES.map((entry, index) => (
          <button
            key={entry.name}
            type="button"
            onClick={() => setActive(index)}
            className={`relative shrink-0 rounded-lg px-2.5 py-1.5 font-mono text-[10px] transition-colors ${
              index === active ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {index === active ? (
              <motion.span
                layoutId="diff-tab"
                className="absolute inset-0 -z-10 rounded-lg border border-sky-400/25 bg-sky-400/10"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            ) : null}
            <span className="hidden sm:inline">{entry.name.split("/").pop()}</span>
            <span className="sm:hidden">{entry.name.split("/").pop()?.slice(0, 10)}</span>
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 items-center gap-2 self-center pr-1.5 font-mono text-[10px] sm:flex">
          <span className="text-emerald-400">+{file.added}</span>
          <span className="text-rose-400">−{file.removed}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={file.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="apex-scrollbar-none h-52 overflow-y-auto p-3 font-mono text-[10.5px] leading-[1.75] sm:h-56"
        >
          {file.lines.map((line, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, x: line.sign === "+" ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.035, duration: 0.32, ease: EASE_OUT }}
              className={`flex gap-2.5 rounded-sm px-1 ${
                line.sign === "+"
                  ? "bg-emerald-400/[0.07]"
                  : line.sign === "-"
                    ? "bg-rose-400/[0.07]"
                    : ""
              }`}
            >
              <span
                className={`w-2 shrink-0 select-none ${
                  line.sign === "+"
                    ? "text-emerald-400"
                    : line.sign === "-"
                      ? "text-rose-400"
                      : "text-zinc-700"
                }`}
              >
                {line.sign}
              </span>
              <span
                className={`min-w-0 break-words whitespace-pre-wrap ${
                  line.sign === "+"
                    ? "text-emerald-100/90"
                    : line.sign === "-"
                      ? "text-rose-100/70 line-through decoration-rose-400/40"
                      : "text-zinc-500"
                }`}
              >
                {line.code}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card 2 — Self-healing build diagnostics                            */
/* ------------------------------------------------------------------ */

const HEAL_STAGES = [
  {
    id: "detect",
    label: "Detect",
    icon: ScanSearch,
    tone: "text-rose-400",
    ring: "border-rose-400/40 bg-rose-400/10",
    body: "tsc(1) surfaced 3 type errors across 2 files",
    detail: "TS2345 · TS18046 · TS2554",
  },
  {
    id: "diagnose",
    label: "Diagnose",
    icon: Wrench,
    tone: "text-amber-300",
    ring: "border-amber-300/40 bg-amber-300/10",
    body: "traced root cause to a narrowed generic",
    detail: "route handler lost its param type",
  },
  {
    id: "patch",
    label: "Patch",
    icon: FileCode,
    tone: "text-sky-300",
    ring: "border-sky-400/40 bg-sky-400/10",
    body: "rewrote signature, added guard clause",
    detail: "+6 −2 · route.ts",
  },
  {
    id: "verify",
    label: "Verify",
    icon: Check,
    tone: "text-emerald-400",
    ring: "border-emerald-400/40 bg-emerald-400/10",
    body: "typecheck clean · 24 tests green",
    detail: "loop closed in 8.4s",
  },
] as const;

function HealFlow() {
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(
      () => setStage((current) => (current + 1) % HEAL_STAGES.length),
      1900,
    );
    return () => window.clearTimeout(timer);
  }, [paused, stage]);

  const active = HEAL_STAGES[stage];
  const progress = ((stage + 1) / HEAL_STAGES.length) * 100;
  const ActiveIcon = active.icon;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-1.5">
        {HEAL_STAGES.map((entry, index) => {
          const Icon = entry.icon;
          const isActive = index === stage;
          const isDone = index < stage;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => {
                setStage(index);
                setPaused(true);
              }}
              aria-label={`Show ${entry.label} stage`}
              aria-pressed={isActive}
              className={`relative flex-1 rounded-xl border px-2 py-2.5 transition-colors duration-300 ${
                isActive
                  ? entry.ring
                  : isDone
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-white/8 bg-white/[0.02]"
              }`}
            >
              <span className="flex flex-col items-center gap-1.5">
                <Icon className={`size-4 ${isActive ? entry.tone : isDone ? "text-emerald-400/70" : "text-zinc-600"}`} />
                <span
                  className={`font-mono text-[9px] tracking-wide uppercase ${
                    isActive ? entry.tone : isDone ? "text-emerald-400/70" : "text-zinc-600"
                  }`}
                >
                  {entry.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-white/8 bg-obsidian-sunken/80 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-lg ${active.ring}`}>
            <ActiveIcon className={`size-3.5 ${active.tone}`} />
          </span>
          <div className="min-w-0">
            <AnimatePresence mode="wait">
              <motion.p
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="font-mono text-[11px] text-zinc-200"
              >
                {active.body}
              </motion.p>
            </AnimatePresence>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">{active.detail}</p>
          </div>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-rose-400 via-amber-300 to-emerald-400"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setStage(0);
          setPaused((value) => !value);
        }}
        className="inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 transition-colors hover:text-sky-300"
      >
        {paused ? (
          <Play className="size-3 fill-current" />
        ) : (
          <RefreshCw className="size-3" />
        )}
        {paused ? "resume loop" : "pause loop"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card 3 — Deep repository context                                    */
/* ------------------------------------------------------------------ */

type Node = { id: string; x: number; y: number; label: string; hub?: boolean };
type Edge = { from: string; to: string };

const NODES: Node[] = [
  { id: "app", x: 20, y: 50, label: "app", hub: true },
  { id: "auth", x: 45, y: 24, label: "auth" },
  { id: "store", x: 45, y: 76, label: "store" },
  { id: "lib", x: 70, y: 20, label: "lib" },
  { id: "db", x: 70, y: 52, label: "db" },
  { id: "ui", x: 70, y: 84, label: "ui" },
  { id: "mail", x: 92, y: 36, label: "mail" },
];

const EDGES: Edge[] = [
  { from: "app", to: "auth" },
  { from: "app", to: "store" },
  { from: "auth", to: "lib" },
  { from: "auth", to: "db" },
  { from: "store", to: "db" },
  { from: "store", to: "ui" },
  { from: "db", to: "mail" },
  { from: "lib", to: "mail" },
];

const byId = (id: string) => NODES.find((node) => node.id === id)!;

function DependencyGraph() {
  const [hovered, setHovered] = useState<string | null>("db");

  const connected = new Set<string>();
  if (hovered) {
    connected.add(hovered);
    EDGES.forEach((edge) => {
      if (edge.from === hovered) connected.add(edge.to);
      if (edge.to === hovered) connected.add(edge.from);
    });
  }

  return (
    <div className="mt-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-obsidian-sunken/80">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(139,92,246,0.12),transparent_70%)]"
        />
        <svg viewBox="0 0 100 60" className="relative h-44 w-full sm:h-52" role="img" aria-label="Animated repository dependency graph">
          {EDGES.map((edge, index) => {
            const a = byId(edge.from);
            const b = byId(edge.to);
            const lit = hovered !== null && connected.has(a.id) && connected.has(b.id);
            return (
              <g key={`${edge.from}-${edge.to}`}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={lit ? "#38BDF8" : "#334155"}
                  strokeWidth={lit ? 0.5 : 0.3}
                  opacity={hovered === null ? 0.5 : lit ? 0.95 : 0.16}
                  style={{ transition: "opacity 400ms ease, stroke 400ms ease" }}
                />
                {lit ? (
                  <circle r="0.75" fill="#E0F2FE">
                    <animateMotion
                      dur={`${1.5 + index * 0.12}s`}
                      repeatCount="indefinite"
                      path={`M ${a.x} ${a.y} L ${b.x} ${b.y}`}
                    />
                  </circle>
                ) : null}
              </g>
            );
          })}
          {NODES.map((node) => {
            const lit = connected.has(node.id);
            return (
              <g
                key={node.id}
                onPointerEnter={() => setHovered(node.id)}
                onPointerLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              >
                {node.hub ? (
                  <circle cx={node.x} cy={node.y} r="5.4" fill="none" stroke="#38BDF8" strokeWidth="0.3" opacity="0.6">
                    <animate attributeName="r" values="4.4;6.6;4.4" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
                  </circle>
                ) : null}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.hub ? 3.4 : 2.6}
                  fill={lit ? (node.hub ? "#38BDF8" : "#A78BFA") : "#1E293B"}
                  stroke={lit ? "#E2E8F0" : "#475569"}
                  strokeWidth="0.35"
                  style={{ transition: "fill 300ms ease" }}
                />
                <text
                  x={node.x}
                  y={node.y + 7.4}
                  textAnchor="middle"
                  className="fill-zinc-500 font-mono"
                  style={{ fontSize: "3.1px", letterSpacing: "0.02em" }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 font-mono text-[10px] text-zinc-600">
        {hovered
          ? `tracing ${hovered} → ${connected.size - 1} dependents`
          : "hover a node to trace its dependents"}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grid                                                                 */
/* ------------------------------------------------------------------ */

function CardFrame({
  children,
  className = "",
  tone = "sky",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "sky" | "violet";
}) {
  return (
    <SpotlightCard
      tone={tone}
      className={`rounded-3xl border border-white/8 bg-obsidian-raised/35 p-6 backdrop-blur-md transition-colors duration-500 hover:border-white/14 sm:p-7 ${className}`}
    >
      {children}
    </SpotlightCard>
  );
}

function IconBadge({
  children,
  tone = "sky",
}: {
  children: React.ReactNode;
  tone?: "sky" | "violet";
}) {
  const ring =
    tone === "sky"
      ? "border-sky-400/25 bg-sky-400/10 text-sky-300"
      : "border-violet-400/25 bg-violet-400/10 text-violet-300";
  return (
    <span
      className={`inline-flex size-10 items-center justify-center rounded-xl border ${ring} shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`}
    >
      {children}
    </span>
  );
}

export function ApexFeatures() {
  return (
    <section id="features" className="relative scroll-mt-24 py-20 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 -z-20 size-[38rem] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]"
      />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Capabilities"
            title={
              <>
                Everything between the prompt and
                <span className="apex-text-gradient"> production</span>
              </>
            }
            description="Three subsystems run on every task: the agent edits across files, verifies its own work, and carries the full dependency graph of your repository."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal className="md:col-span-2">
            <CardFrame className="h-full">
              <div className="flex items-start gap-4">
                <IconBadge>
                  <FileCode className="size-5" />
                </IconBadge>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-50">
                    Autonomous multi-file editing
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
                    One instruction, dozens of coordinated edits. The agent plans
                    the change set, applies it, and shows you the diff before it
                    touches a branch.
                  </p>
                </div>
              </div>
              <DiffPreview />
            </CardFrame>
          </Reveal>

          <Reveal delay={0.08}>
            <CardFrame tone="violet" className="h-full">
              <div className="flex items-start gap-4">
                <IconBadge tone="violet">
                  <Wrench className="size-5" />
                </IconBadge>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-50">
                    Self-healing build diagnostics
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    It reads the compiler, forms a hypothesis, patches the source
                    and re-runs the check. No hand-off required.
                  </p>
                </div>
              </div>
              <HealFlow />
            </CardFrame>
          </Reveal>

          <Reveal delay={0.12}>
            <CardFrame className="h-full">
              <div className="flex items-start gap-4">
                <IconBadge>
                  <Network className="size-5" />
                </IconBadge>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-50">
                    Deep repository context
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    Imports, types and call sites are indexed into a live graph, so
                    a change propagates everywhere it should.
                  </p>
                </div>
              </div>
              <DependencyGraph />
            </CardFrame>
          </Reveal>

          <Reveal delay={0.16} className="md:col-span-2">
            <CardFrame tone="violet" className="h-full">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-sm">
                  <div className="flex items-start gap-4">
                    <IconBadge tone="violet">
                      <GitBranch className="size-5" />
                    </IconBadge>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-zinc-50">
                        Runs anywhere your code does
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                        No language plugin, no index rebuild. Point the CLI at a
                        folder and it starts from the existing conventions.
                      </p>
                    </div>
                  </div>
                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {CAPABILITIES.map((language) => (
                      <li
                        key={language}
                        className="rounded-lg border border-white/8 bg-black/30 px-2.5 py-1 font-mono text-[10px] text-zinc-400 transition-colors duration-300 hover:border-violet-400/40 hover:text-violet-200"
                      >
                        {language}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="grid shrink-0 grid-cols-2 gap-3 sm:w-56">
                  {[
                    { k: "index build", v: "< 4s" },
                    { k: "context window", v: "2M tok" },
                    { k: "sandbox spin-up", v: "0.8s" },
                    { k: "parallel lanes", v: "×8" },
                  ].map((row) => (
                    <div
                      key={row.k}
                      className="rounded-xl border border-white/8 bg-black/25 px-3 py-2.5"
                    >
                      <p className="font-mono text-[9px] tracking-wide text-zinc-600 uppercase">
                        {row.k}
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-200">{row.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}