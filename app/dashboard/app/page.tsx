"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import {
  LoaderCircle,
  PanelLeft,
  PanelRight,
  Play,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/providers/toast-provider";
import { FileExplorer } from "@/components/ide/file-explorer";
import { CodeEditor } from "@/components/ide/code-editor";
import {
  PreviewPane,
  type ConsoleEntry,
  type PreviewTab,
} from "@/components/ide/preview-pane";
import { isPreviewable } from "@/components/ide/file-tree";
import type { AgentEvent } from "./types";

let entryCounter = 0;

function createEntry(
  kind: ConsoleEntry["kind"],
  text: string,
  label?: string,
): ConsoleEntry {
  entryCounter += 1;

  return {
    id: entryCounter,
    kind,
    text,
    label,
    time: new Date().toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

export default function Home() {
  const { pushToast } = useToast();

  const [files, setFiles] = useState<string[]>([]);
  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [savedContents, setSavedContents] = useState<Record<string, string>>(
    {},
  );
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [savingPath, setSavingPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [tab, setTab] = useState<PreviewTab>("preview");
  const [previewPath, setPreviewPath] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);

  const activePathRef = useRef<string | null>(null);
  const openPathsRef = useRef<string[]>([]);
  const contentsRef = useRef<Record<string, string>>({});
  const savedContentsRef = useRef<Record<string, string>>({});
  const loadedRef = useRef(new Set<string>());
  const previewPathRef = useRef<string | null>(null);

  useEffect(() => {
    activePathRef.current = activePath;
  }, [activePath]);

  useEffect(() => {
    openPathsRef.current = openPaths;
  }, [openPaths]);

  useEffect(() => {
    contentsRef.current = contents;
  }, [contents]);

  useEffect(() => {
    savedContentsRef.current = savedContents;
  }, [savedContents]);

  const pushEntry = useCallback(
    (kind: ConsoleEntry["kind"], text: string, label?: string) => {
      setEntries((previous) => [...previous.slice(-199), createEntry(kind, text, label)]);
    },
    [],
  );

  const loadFiles = useCallback(async () => {
    try {
      const response = await fetch("/api/workspace");
      const data = (await response.json()) as { files?: string[] };
      setFiles(Array.isArray(data.files) ? data.files : []);
    } catch {
      setFiles([]);
    }
  }, []);

  const reloadFile = useCallback(async (path: string) => {
    try {
      const response = await fetch(
        `/api/workspace/file?file=${encodeURIComponent(path)}`,
      );

      if (!response.ok) return;

      const data = (await response.json()) as { content?: string };
      const content = typeof data.content === "string" ? data.content : "";

      setContents((previous) => ({ ...previous, [path]: content }));
      setSavedContents((previous) => ({ ...previous, [path]: content }));
    } catch {
    }
  }, []);

  const openFile = useCallback(
    async (path: string) => {
      setActivePath(path);
      setOpenPaths((previous) =>
        previous.includes(path) ? previous : [...previous, path],
      );

      if (loadedRef.current.has(path)) return;

      loadedRef.current.add(path);

      try {
        const response = await fetch(
          `/api/workspace/file?file=${encodeURIComponent(path)}`,
        );

        if (!response.ok) throw new Error("File not found");

        const data = (await response.json()) as { content?: string };
        const content = typeof data.content === "string" ? data.content : "";

        setContents((previous) => ({ ...previous, [path]: content }));
        setSavedContents((previous) => ({ ...previous, [path]: content }));
      } catch {
        loadedRef.current.delete(path);
      }
    },
    [],
  );

  const closeFile = useCallback((path: string) => {
    setOpenPaths((previous) => {
      const next = previous.filter((candidate) => candidate !== path);

      if (activePathRef.current === path) {
        setActivePath(next[next.length - 1] ?? null);
      }

      return next;
    });

    setContents((previous) => {
      const next = { ...previous };
      delete next[path];
      return next;
    });

    setSavedContents((previous) => {
      const next = { ...previous };
      delete next[path];
      return next;
    });

    loadedRef.current.delete(path);
  }, []);

  const saveFile = useCallback(
    async (path: string) => {
      const content = contentsRef.current[path];

      if (content === undefined) return;

      setSavingPath(path);

      try {
        const response = await fetch("/api/workspace/file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: path, content }),
        });

        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to save file");
        }

        setSavedContents((previous) => ({ ...previous, [path]: content }));
        pushEntry("system", `Saved ${path}`);
      } catch (error) {
        pushToast({
          variant: "error",
          title: "Could not save file",
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setSavingPath(null);
      }
    },
    [pushEntry, pushToast],
  );

  const handleAgentEvent = useCallback(
    (event: AgentEvent) => {
      if (event.type === "message") {
        pushEntry("message", event.content);
      } else if (event.type === "tool_call") {
        pushEntry("tool", JSON.stringify(event.args, null, 2), event.tool);
      } else if (event.type === "tool_result") {
        pushEntry(
          "tool",
          typeof event.result === "string"
            ? event.result
            : JSON.stringify(event.result, null, 2),
          event.tool,
        );
      } else if (event.type === "error") {
        pushEntry("error", event.message);
      }
    },
    [pushEntry],
  );

  const runAgent = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();

      if (!prompt.trim() || running) return;

      setRunning(true);
      setTab("console");
      pushEntry("system", `Agent run started: ${prompt.trim()}`);

      try {
        const response = await fetch("/api/agent/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;

            let agentEvent: AgentEvent;

            try {
              agentEvent = JSON.parse(line) as AgentEvent;
            } catch {
              continue;
            }

            handleAgentEvent(agentEvent);
          }
        }

        pushEntry("system", "Agent run completed");
      } catch (error) {
        pushEntry(
          "error",
          error instanceof Error ? error.message : "Agent request failed",
        );
      } finally {
        await loadFiles();
        setRunning(false);
      }
    },
    [prompt, running, handleAgentEvent, loadFiles, pushEntry],
  );

  useEffect(() => {
    const load = async () => {
      await loadFiles();
    };

    void load();
  }, [loadFiles]);

  useEffect(() => {
    const source = new EventSource("/api/workspace/events");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    source.onmessage = (event) => {
      let data: {
        type?: string;
        path?: string;
        stream?: string;
        data?: string;
      };

      try {
        data = JSON.parse(event.data) as typeof data;
      } catch {
        return;
      }

      if (data.type === "process_output") {
        pushEntry(
          data.stream === "stderr" ? "stderr" : "stdout",
          data.data ?? "",
        );
        return;
      }

      if (
        data.type === "created" ||
        data.type === "changed" ||
        data.type === "deleted"
      ) {
        void loadFiles();

        const current = activePathRef.current;

        if (data.type === "changed" && current && data.path === current) {
          const saved = savedContentsRef.current[current];
          const edited = contentsRef.current[current];

          if (edited === undefined || edited === saved) {
            void reloadFile(current);
          }
        }

        if (data.type === "deleted" && data.path) {
          if (openPathsRef.current.includes(data.path)) {
            closeFile(data.path);
          }

          if (previewPathRef.current === data.path) {
            setPreviewNonce((previous) => previous + 1);
          }
        }

        if (data.type === "created" && data.path && isPreviewable(data.path)) {
          setPreviewNonce((previous) => previous + 1);
        }
      }
    };

    return () => {
      source.close();
    };
  }, [loadFiles, pushEntry, reloadFile, closeFile]);

  const previewTarget =
    activePath && isPreviewable(activePath)
      ? activePath
      : (files.find((candidate) => isPreviewable(candidate)) ?? null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const target = previewTarget;

      previewPathRef.current = target;
      setPreviewPath(target);

      if (!target) {
        setPreviewHtml(null);
        setPreviewLoading(false);
        return;
      }

      setPreviewLoading(true);

      try {
        const response = await fetch(
          `/api/workspace/file?file=${encodeURIComponent(target)}`,
        );

        const data = response.ok
          ? ((await response.json()) as { content?: string })
          : null;

        if (cancelled) return;

        const content = data?.content;
        setPreviewHtml(typeof content === "string" ? content : null);
      } catch {
        if (!cancelled) {
          setPreviewHtml(null);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [files, activePath, savedContents, previewNonce, previewTarget]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#0b0f17] text-zinc-200">
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

          <button
            type="button"
            onClick={() => setSidebarOpen((previous) => !previous)}
            title="Toggle explorer"
            aria-label="Toggle explorer"
            className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            <PanelLeft className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen((previous) => !previous)}
            title="Toggle preview"
            aria-label="Toggle preview"
            className="rounded-md p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            <PanelRight className="size-4" />
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#0d1320] transition-transform duration-200 lg:static lg:w-60 lg:translate-x-0 lg:transition-none",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:hidden",
          )}
        >
          <FileExplorer
            files={files}
            activePath={activePath}
            openPaths={openPaths}
            onSelect={(path) => {
              void openFile(path);
              setSidebarOpen((previous) =>
                typeof window === "undefined" || window.innerWidth >= 1024
                  ? previous
                  : false,
              );
            }}
          />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-[#0b0f17]">
          <CodeEditor
            openPaths={openPaths}
            activePath={activePath}
            contents={contents}
            savedContents={savedContents}
            savingPath={savingPath}
            onSelect={(path) => void openFile(path)}
            onChange={(path, content) =>
              setContents((previous) => ({ ...previous, [path]: content }))
            }
            onSave={(path) => void saveFile(path)}
            onClose={closeFile}
          />
        </main>

        {previewOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setPreviewOpen(false)}
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 right-0 z-40 flex w-[420px] max-w-full flex-col border-l border-white/10 bg-[#0d1320] transition-transform duration-200 lg:static lg:w-[380px] lg:translate-x-0 lg:transition-none",
            previewOpen ? "translate-x-0" : "translate-x-full lg:hidden",
          )}
        >
          <PreviewPane
            tab={tab}
            onTabChange={setTab}
            previewPath={previewPath}
            previewHtml={previewHtml}
            previewLoading={previewLoading}
            onRefresh={() => setPreviewNonce((previous) => previous + 1)}
            entries={entries}
            onClearConsole={() => setEntries([])}
          />
        </aside>
      </div>
    </div>
  );
}
