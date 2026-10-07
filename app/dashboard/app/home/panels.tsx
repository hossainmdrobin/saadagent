"use client";

import { cn } from "@/lib/cn";
import { FileExplorer } from "@/components/ide/file-explorer";
import { CodeEditor } from "@/components/ide/code-editor";
import { PreviewPane } from "@/components/ide/preview-pane";

import { HomeEmptyState } from "./empty-state";

export function HomePanels({
  state,
  fileOps,
}: {
  state: ReturnType<typeof import("./use-home-state").useHomeState>;
  fileOps: ReturnType<typeof import("./use-file-callbacks").useFileCallbacks>;
}) {
  const {
    sidebarOpen,
    editorOpen,
    previewOpen,
    setSidebarOpen,
    setPreviewOpen,
    files,
    activePath,
    openPaths,
    contents,
    setContents,
    savedContents,
    savingPath,
    tab,
    setTab,
    previewPath,
    previewHtml,
    previewLoading,
    setPreviewNonce,
    entries,
    setEntries,
  } = state;

  const { openFile, closeFile, saveFile } = fileOps;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#0d1320] transition-transform duration-200 lg:static lg:translate-x-0 lg:transition-none",
          sidebarOpen
            ? cn(
                "translate-x-0",
                editorOpen
                  ? "lg:w-60 lg:flex-none"
                  : "lg:w-auto lg:flex-1",
              )
            : "-translate-x-full lg:hidden",
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

      <main
        className={cn(
          "min-w-0 flex-col bg-[#0b0f17]",
          editorOpen ? "flex flex-1" : "hidden",
        )}
      >
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
          "fixed inset-y-0 right-0 z-40 flex w-[420px] max-w-full flex-col border-l border-white/10 bg-[#0d1320] transition-transform duration-200 lg:static lg:translate-x-0 lg:transition-none",
          previewOpen
            ? cn(
                "translate-x-0",
                editorOpen
                  ? "lg:w-[380px] lg:flex-none"
                  : "lg:w-auto lg:flex-1",
              )
            : "translate-x-full lg:hidden",
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

      {!sidebarOpen && !editorOpen && !previewOpen && (
        <HomeEmptyState state={state} />
      )}
    </>
  );
}
