export function ApexMark({ className = "size-9" }: { className?: string }) {
  return (
    <span className={`relative inline-flex items-center justify-center ${className}`}>
      <span className="absolute inset-0 rounded-xl bg-sky-400/25 blur-lg" />
      <svg
        viewBox="0 0 40 40"
        className="relative size-full"
        role="img"
        aria-label="ApexCode logo"
      >
        <defs>
          <linearGradient id="apex-mark-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="11"
          fill="#0B0F17"
          stroke="url(#apex-mark-fill)"
          strokeWidth="1.4"
        />
        <path
          d="M12 29 L20 10 L28 29"
          fill="none"
          stroke="url(#apex-mark-fill)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.6 22.4 H24.4"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function ApexWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="text-[17px] font-semibold tracking-tight text-zinc-50">
        ApexCode
      </span>
      <span className="rounded-md border border-sky-400/30 bg-sky-400/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.35)]">
        AI
      </span>
    </span>
  );
}

export function Eyebrow({
  children,
  tone = "sky",
}: {
  children: React.ReactNode;
  tone?: "sky" | "violet";
}) {
  const ring =
    tone === "sky"
      ? "border-sky-400/25 bg-sky-400/[0.07] text-sky-200"
      : "border-violet-400/25 bg-violet-400/[0.07] text-violet-200";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium tracking-[0.16em] uppercase backdrop-blur-md ${ring}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "sky",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  tone?: "sky" | "violet";
}) {
  const alignment =
    align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${alignment}`}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className="text-3xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-pretty text-zinc-400">{description}</p>
      ) : null}
    </div>
  );
}