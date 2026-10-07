"use client";

import { useEffect, useRef, useState } from "react";
import {
  Monitor,
  RefreshCw,
  Smartphone,
  Sparkles,
  SquareTerminal,
  Tablet,
  Trash2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type ConsoleKind =
  | "stdout"
  | "stderr"
  | "message"
  | "tool"
  | "error"
  | "system";

export interface ConsoleEntry {
  id: number;
  kind: ConsoleKind;
  text: string;
  label?: string;
  time: string;
}

export type PreviewTab = "preview" | "console";

type ViewportId = "desktop" | "tablet" | "mobile";

interface Viewport {
  id: ViewportId;
  label: string;
  icon: LucideIcon;
  widthClass: string;
}

const VIEWPORTS: Viewport[] = [
  {
    id: "desktop",
    label: "Desktop",
    icon: Monitor,
    widthClass: "w-full",
  },
  {
    id: "tablet",
    label: "Tablet",
    icon: Tablet,
    widthClass: "w-[768px]",
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    widthClass: "w-[390px]",
  },
];

interface PreviewPaneProps {
  tab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  previewPath: string | null;
  previewHtml: string | null;
  previewLoading: boolean;
  onRefresh: () => void;
  entries: ConsoleEntry[];
  onClearConsole: () => void;
}

function ConsoleRow({ entry }: { entry: ConsoleEntry }) {
  const time = entry.time;

  if (entry.kind === "message") {
    return (
      <div className="rounded-lg border border-sky-400/20 bg-sky-400/[0.06] px-3 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-400">
          <Sparkles className="size-3" />
          Agent
          <span className="ml-auto font-normal text-zinc-600">{time}</span>
        </div>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-200">
          {entry.text}
        </p>
      </div>
    );
  }

  if (entry.kind === "tool") {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-400">
          <Wrench className="size-3" />
          {entry.label ?? "tool"}
          <span className="ml-auto font-normal text-zinc-600">{time}</span>
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-zinc-400">
          {entry.text}
        </pre>
      </div>
    );
  }

  if (entry.kind === "error") {
    return (
      <div className="rounded-lg border border-red-400/20 bg-red-400/[0.06] px-3 py-2 font-mono text-xs leading-relaxed text-red-300">
        {entry.text}
      </div>
    );
  }

  if (entry.kind === "system") {
    return (
      <p className="py-1 text-center text-[11px] text-zinc-600">
        {entry.text}
      </p>
    );
  }

  return (
    <p
      className={cn(
        "whitespace-pre-wrap break-words font-mono text-xs leading-relaxed",
        entry.kind === "stderr" ? "text-amber-300" : "text-zinc-300",
      )}
    >
      <span className="mr-2 select-none text-zinc-700">{time}</span>
      {entry.text}
    </p>
  );
}

export function PreviewPane({  tab,
  onTabChange,
  previewPath,
  previewHtml,
  previewLoading,
  onRefresh,
  entries,
  onClearConsole,
}: PreviewPaneProps) {
  const [viewport, setViewport] = useState<ViewportId>("desktop");
  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = consoleRef.current;

    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [entries.length]);

  const activeViewport =
    VIEWPORTS.find((candidate) => candidate.id === viewport) ?? VIEWPORTS[0];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-white/10 px-2 py-2">
        <button
          type="button"
          onClick={() => onTabChange("preview")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "preview"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-200",
          )}
        >
          <Monitor className="size-3.5" />
          Preview
        </button>

        <button
          type="button"
          onClick={() => onTabChange("console")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            tab === "console"
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-200",
          )}
        >
          <SquareTerminal className="size-3.5" />
          Console
          {entries.length > 0 && (
            <span className="rounded-full bg-white/10 px-1.5 py-px text-[10px] font-semibold text-zinc-400">
              {entries.length}
            </span>
          )}
        </button>

        {tab === "preview" ? (
          <div className="ml-auto flex items-center gap-1">
            <div className="mr-1 flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.03] p-0.5">
              {VIEWPORTS.map((candidate) => (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => setViewport(candidate.id)}
                  title={candidate.label}
                  className={cn(
                    "rounded p-1 transition-colors",
                    viewport === candidate.id
                      ? "bg-white/10 text-sky-400"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  <candidate.icon className="size-3.5" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onRefresh}
              title="Refresh preview"
              className={cn(
                "rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200",
                previewLoading && "animate-spin",
              )}
            >
              <RefreshCw className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClearConsole}
            title="Clear console"
            className="ml-auto rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {tab === "preview" ? (
        <div className="min-h-0 flex-1 overflow-auto bg-[#070a10] p-4">
          {previewHtml === null ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <Monitor className="size-6 text-zinc-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-300">
                  No preview available
                </p>
                <p className="mt-1 max-w-60 text-xs leading-relaxed text-zinc-500">
                  {previewLoading
                    ? "Loading preview..."
                    : "Select an HTML file or ask the agent to generate a page to see it rendered here."}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "mx-auto min-h-full transition-[width] duration-200",
                activeViewport.widthClass,
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="truncate font-mono text-[10px] text-zinc-600">
                  {previewPath ?? "preview"}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-emerald-400/80">
                  <span className="size-1 rounded-full bg-emerald-400" />
                  Rendered
                </span>
              </div>

              <iframe
                key={previewPath ?? "empty"}
                title="Workspace preview"
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                className="h-[calc(100%-1.75rem)] w-full overflow-auto rounded-lg border border-white/10 bg-white"
              />
            </div>
          )}
        </div>
      ) : (
        <div
          ref={consoleRef}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4"
        >
          {entries.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <SquareTerminal className="size-6 text-zinc-600" />
              <p className="text-xs text-zinc-500">
                Agent output and process logs will appear here.
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <ConsoleRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
