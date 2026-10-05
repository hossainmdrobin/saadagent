"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { ApexMark, ApexWordmark } from "@/components/apex/brand";
import { SHIMMER_BUTTON } from "@/lib/apex/styles";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Playground", href: "#playground" },
  { label: "Pricing", href: "#pricing" },
];

export function ApexNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map((link) =>
      document.querySelector<HTMLElement>(link.href),
    ).filter((node): node is HTMLElement => Boolean(node));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = sections.findIndex(
          (node) => node === visible.target,
        );
        if (index >= 0) setActive(LINKS[index].href);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-white/8 bg-obsidian/72 shadow-[0_18px_50px_-24px_rgba(2,6,23,0.95)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <motion.div
        aria-hidden
        style={{ scaleX: progress }}
        className="absolute inset-x-0 top-0 h-px origin-left bg-linear-to-r from-sky-400 via-violet-400 to-transparent"
      />

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:h-[72px]">
        <Link
          href="#top"
          className="group flex items-center gap-2.5"
          aria-label="ApexCode AI home"
        >
          <ApexMark className="size-9 transition-transform duration-500 group-hover:scale-110" />
          <ApexWordmark />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`group relative block rounded-lg px-3.5 py-2 text-sm transition-colors duration-200 ${
                  active === link.href
                    ? "text-zinc-50"
                    : "text-zinc-400 hover:text-zinc-100"
                }`}
              >
                {active === link.href ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-lg border border-white/8 bg-white/[0.04]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className="relative">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-linear-to-r from-sky-400 to-violet-400 transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:text-zinc-100 lg:block"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={`group hidden items-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-100 shadow-[0_0_24px_-6px_rgba(56,189,248,0.6)] backdrop-blur-md transition-all duration-300 hover:border-sky-300/60 hover:bg-sky-400/20 hover:shadow-[0_0_34px_-4px_rgba(56,189,248,0.85)] sm:inline-flex ${SHIMMER_BUTTON}`}
          >
            Start Coding Free
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="apex-mobile-nav"
            aria-label={open ? "Close navigation" : "Open navigation"}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:text-zinc-50 md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "close" : "menu"}
                initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                className="inline-flex"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="apex-mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/8 bg-obsidian/90 backdrop-blur-xl md:hidden"
          >
            <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-zinc-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2">
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-100"
                >
                  Start Coding Free
                  <ArrowRight className="size-4" />
                </Link>
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}