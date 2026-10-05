"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, CircleCheck, Send, Terminal } from "lucide-react";
import { ApexMark, ApexWordmark } from "@/components/apex/brand";
import { Reveal } from "@/components/apex/motion-primitives";
import { FOOTER_COLUMNS } from "@/lib/apex/content";
import { SHIMMER_BUTTON } from "@/lib/apex/styles";

type Status = "idle" | "sending" | "sent";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function GitHubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function XIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.02 4.13H5.06l12.02 15.64Z" />
    </svg>
  );
}

function LinkedInIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-.96 1.84-1.98 3.78-1.98 4.05 0 4.8 2.5 4.8 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21h-4V9Z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "GitHub", href: "/signup", Icon: GitHubIcon },
  { label: "X", href: "/signup", Icon: XIcon },
  { label: "LinkedIn", href: "/signup", Icon: LinkedInIcon },
];

function SubscribeTerminal() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus("idle");
      setMessage("error: invalid email address");
      return;
    }

    setStatus("sending");
    setMessage("");
    window.setTimeout(() => {
      setStatus("sent");
      setMessage("subscribed — release notes land in your inbox");
    }, 850);
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <label
        htmlFor="apex-release-notes"
        className="mb-2.5 block font-mono text-[11px] tracking-[0.18em] text-zinc-600 uppercase"
      >
        subscribe for release notes
      </label>
      <div className="group flex flex-col gap-2 rounded-2xl border border-white/10 bg-obsidian-sunken/80 p-2 backdrop-blur-md transition-colors duration-300 focus-within:border-sky-400/45 sm:flex-row sm:items-center sm:gap-3 sm:pl-4">
        <span className="flex shrink-0 items-center gap-2 font-mono text-sm text-sky-400">
          <Terminal className="size-3.5" />
          $
        </span>
        <input
          id="apex-release-notes"
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") {
              setStatus("idle");
              setMessage("");
            }
          }}
          placeholder="subscribe --release-notes"
          aria-invalid={status === "idle" && message.startsWith("error")}
          className="min-w-0 flex-1 bg-transparent py-2 font-mono text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-obsidian transition-all duration-300 disabled:opacity-70 ${SHIMMER_BUTTON} bg-linear-to-r from-sky-400 to-violet-400 shadow-[0_0_28px_-8px_rgba(56,189,248,0.9)] hover:shadow-[0_0_40px_-6px_rgba(139,92,246,0.95)]`}
        >
          {status === "sent" ? (
            <CircleCheck className="size-4" />
          ) : (
            <Send className="size-4" />
          )}
          {status === "sent" ? "Subscribed" : status === "sending" ? "Sending…" : "Subscribe"}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={`mt-2.5 h-4 font-mono text-[11px] ${
          message.startsWith("error") ? "text-rose-400" : "text-emerald-400"
        }`}
      >
        {message}
      </p>
    </form>
  );
}

export function ApexFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-white/8 bg-obsidian-sunken">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 apex-mesh opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -z-20 size-[36rem] -translate-x-1/2 rounded-full bg-sky-500/14 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 -z-20 size-[26rem] rounded-full bg-violet-600/14 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-px bg-linear-to-r from-transparent via-sky-400/40 to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,32rem)_1fr] lg:gap-20">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-3xl">
                Your next commit is one prompt away.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
                Install the CLI, point it at a folder, and watch the plan print
                itself before a single file changes.
              </p>
              <div className="mt-8 max-w-lg">
                <SubscribeTerminal />
              </div>
              <div className="mt-8 flex items-center gap-3">
                <span className="flex items-center gap-2 font-mono text-[11px] text-zinc-600">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-status-dot" />
                  all systems operational
                </span>
                <span className="h-3 w-px bg-white/10" />
                <span className="font-mono text-[11px] text-zinc-600">
                  p95 latency 214ms
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="font-mono text-[11px] tracking-[0.18em] text-zinc-500 uppercase">
                    {column.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a
                          href={link === "Sign in" ? "/login" : "/signup"}
                          className="group inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors duration-200 hover:text-zinc-100"
                        >
                          {link}
                          <ArrowUpRight className="size-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/8 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ApexMark className="size-8" />
            <ApexWordmark />
            <span className="ml-2 hidden font-mono text-[11px] text-zinc-700 sm:inline">
              © 2026 ApexCode AI
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-white/8 bg-white/[0.02] text-zinc-500 transition-all duration-300 hover:border-sky-400/40 hover:text-sky-300 hover:shadow-[0_0_20px_-6px_rgba(56,189,248,0.8)]"
                >
                  <Icon />
                </a>
              ))}
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-mono text-[11px] text-zinc-700 sm:inline"
            >
              built for developers who ship
            </motion.span>
          </div>
        </div>
      </div>
    </footer>
  );
}