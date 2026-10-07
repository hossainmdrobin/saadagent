"use client";

import { useRef, useState } from "react";
import { FileCode, Save, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/spinner";
import { getBaseName, getFileIcon, getLanguage } from "./file-tree";
import { SyntaxHighlighter } from "./syntax-highlighter";

interface CodeEditorProps {
  openPaths: string[];
  activePath: string | null;
  contents: Record<string, string>;
  savedContents: Record<string, string>;
  savingPath: string | null;
  onSelect: (path: string) => void;
  onChange: (path: string, content: string) => void;
  onSave: (path: string) => void;
  onClose: (path: string) => void;
}

export function CodeEditor({
  openPaths,
  activePath,
  contents,
  savedContents,
  savingPath,
  onSelect,
  onChange,
  onSave,
  onClose,
}: CodeEditorProps) {
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const content = activePath ? (contents[activePath] ?? "") : "";
  const language = activePath ? getLanguage(activePath) : "plaintext";
  const lineCount = content.length > 0 ? content.split("\n").length : 1;
  const isDirty =
    activePath !== null &&
    contents[activePath] !== undefined &&
    contents[activePath] !== savedContents[activePath];
  const isSaving = savingPath !== null && savingPath === activePath;

  const updateCursor = (element: HTMLTextAreaElement) => {
    const value = element.value.slice(0, element.selectionStart);
    const lines = value.split("\n");
    setCursor({ line: lines.length, column: (lines.at(-1) ?? "").length + 1 });
  };

  const syncScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const element = event.currentTarget;

    if (highlightRef.current) {
      highlightRef.current.scrollTop = element.scrollTop;
      highlightRef.current.scrollLeft = element.scrollLeft;
    }

    if (gutterRef.current) {
      gutterRef.current.scrollTop = element.scrollTop;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();

      if (activePath) {
        onSave(activePath);
      }

      return;
    }

    if (event.key === "Tab" && activePath) {
      event.preventDefault();

      const element = event.currentTarget;
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const next = content.slice(0, start) + "  " + content.slice(end);

      onChange(activePath, next);
      requestAnimationFrame(() => {
        element.selectionStart = element.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-stretch border-b border-white/10 bg-[#0d1320]">
        <div className="flex min-w-0 flex-1 items-end overflow-x-auto">
          {openPaths.map((path) => {
            const Icon = getFileIcon(path);
            const active = path === activePath;
            const dirty =
              contents[path] !== undefined &&
              contents[path] !== savedContents[path];

            return (
              <button
                key={path}
                type="button"
                onClick={() => onSelect(path)}
                className={cn(
                  "group flex shrink-0 items-center gap-2 border-r border-white/5 px-4 py-2.5 text-xs transition-colors",
                  active
                    ? "bg-[#0b0f17] text-white"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200",
                )}
                title={path}
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0",
                    active ? "text-sky-400" : "text-zinc-600",
                  )}
                />
                <span className="max-w-40 truncate font-medium">
                  {getBaseName(path)}
                </span>
                {dirty ? (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-amber-400"
                    title="Unsaved changes"
                  />
                ) : (
                  <span
                    role="button"
                    tabIndex={-1}
                    onClick={(event) => {
                      event.stopPropagation();
                      onClose(path);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        onClose(path);
                      }
                    }}
                    className="hidden size-4 shrink-0 items-center justify-center rounded group-hover:flex hover:bg-white/10"
                    aria-label={`Close ${path}`}
                  >
                    <X className="size-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activePath && (
          <div className="flex shrink-0 items-center border-l border-white/5 px-3">
            <button
              type="button"
              onClick={() => onSave(activePath)}
              disabled={!isDirty || isSaving}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors",
                isDirty
                  ? "bg-sky-500 text-white hover:bg-sky-400"
                  : "border border-white/10 text-zinc-500",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {isSaving ? (
                <Spinner className="size-3" label="Saving file" />
              ) : (
                <Save className="size-3.5" />
              )}
              {isSaving ? "Saving" : "Save"}
            </button>
          </div>
        )}
      </div>

      {activePath ? (
        <>
          <div className="flex min-h-0 flex-1">
            <div
              ref={gutterRef}
              className="w-12 shrink-0 select-none overflow-hidden border-r border-white/5 bg-[#0d1320] px-2 py-4 text-right font-mono text-[13px] leading-[1.6] text-zinc-700"
              aria-hidden
            >
              {Array.from({ length: lineCount }, (_, index) => (
                <div
                  key={index}
                  className={cn(index + 1 === cursor.line && "text-sky-400")}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            <div className="relative min-w-0 flex-1">
              <pre
                ref={highlightRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden px-4 py-4 font-mono text-[13px] leading-[1.6]"
                style={{ tabSize: 2, whiteSpace: "pre" }}
              >
                <SyntaxHighlighter code={content} language={language} />
                {"\n"}
              </pre>

              <textarea
                value={content}
                onChange={(event) => {
                  onChange(activePath, event.target.value);
                  updateCursor(event.target);
                }}
                onScroll={syncScroll}
                onSelect={(event) => updateCursor(event.currentTarget)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                aria-label={`Editing ${activePath}`}
                className="absolute inset-0 resize-none overflow-auto whitespace-pre bg-transparent px-4 py-4 font-mono text-[13px] leading-[1.6] text-transparent caret-sky-400 outline-none"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>

          <div className="flex h-8 shrink-0 items-center justify-between border-t border-white/5 bg-[#0d1320] px-4 text-[11px] text-zinc-500">
            <div className="flex items-center gap-3">
              {isDirty ? (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="size-1.5 rounded-full bg-amber-400" />
                  Modified
                </span>
              ) : (
                savedContents[activePath] !== undefined && (
                  <span className="text-emerald-400/80">Saved</span>
                )
              )}
              <span className="hidden truncate sm:inline">{activePath}</span>
            </div>

            <div className="flex items-center gap-3">
              <span>
                Ln {cursor.line}, Col {cursor.column}
              </span>
              <span>{lineCount} lines</span>
              <span className="capitalize">{language}</span>
              <span className="hidden sm:inline">UTF-8</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <FileCode className="size-6 text-zinc-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300">
              No file selected
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Choose a file from the explorer or ask the agent to generate one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
