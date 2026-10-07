"use client";

import { cn } from "@/lib/cn";
import {
  LoaderCircle,
  PanelLeft,
  PanelRight,
  Play,
  Sparkles,
  SquareCode,
} from "lucide-react";

import { PanelToggle } from "./panel-toggle";

export function HomeHeader({
  state,
  agent,
}: {
  state: ReturnType<typeof import("./use-home-state").useHomeState>;
  agent: ReturnType<typeof import("./use-agent-callbacks").useAgentCallbacks>;
}) {
  const {
    prompt,
    setPrompt,
    running,
    connected,
    sidebarOpen,
    editorOpen,
    previewOpen,
    setSidebarOpen,
    setEditorOpen,
    setPreviewOpen,
  } = state;

  const { runAgent } = agent;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-[#0d1320] px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-violet-500">
          <Sparkles className="size-4 text-white" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-white">SaadAgent</h1>
          <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">
            Workspace IDE
          </p>
        </div>
      </div>

      <form
        onSubmit={runAgent}
        className="mx-auto flex w-full max-w-2xl items-center gap-2"
      >
        <div className="relative flex-1">
          <Sparkles className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Ask the agent to build or edit something..."
            spellCheck={false}
            className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-sky-400/50 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={running || !prompt.trim()}
          className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-sky-500 px-4 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          {running ? "Running" : "Run"}
        </button>
      </form>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            "hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:flex",
            connected
              ? "border-emerald-400/20 text-emerald-400"
              : "border-white/10 text-zinc-500",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              connected
                ? "bg-emerald-400 animate-status-dot"
                : "bg-zinc-600",
            )}
          />
          {connected ? "Live" : "Offline"}
        </span>

        <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
          <PanelToggle
            icon={PanelLeft}
            label="Explorer"
            active={sidebarOpen}
            onToggle={() => setSidebarOpen((previous) => !previous)}
          />

          <PanelToggle
            icon={SquareCode}
            label="Editor"
            active={editorOpen}
            onToggle={() => setEditorOpen((previous) => !previous)}
          />

          <PanelToggle
            icon={PanelRight}
            label="Preview"
            active={previewOpen}
            onToggle={() => setPreviewOpen((previous) => !previous)}
          />
        </div>
      </div>
    </header>
  );
}
