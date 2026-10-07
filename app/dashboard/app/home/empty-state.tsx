"use client";

import { PanelsTopLeft, PanelLeft, SquareCode, PanelRight } from "lucide-react";

export function HomeEmptyState({
  state,
}: {
  state: ReturnType<typeof import("./use-home-state").useHomeState>;
}) {
  const { setSidebarOpen, setEditorOpen, setPreviewOpen } = state;

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <PanelsTopLeft className="size-6 text-zinc-600" />
      </div>

      <div>
        <p className="text-sm font-medium text-zinc-300">
          All panels are hidden
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Enable a panel from the header to continue working.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5"
        >
          <PanelLeft className="size-3.5" />
          Explorer
        </button>

        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5"
        >
          <SquareCode className="size-3.5" />
          Editor
        </button>

        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/5"
        >
          <PanelRight className="size-3.5" />
          Preview
        </button>
      </div>
    </div>
  );
}
