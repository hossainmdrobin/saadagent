"use client";

import { useCallback, useEffect } from "react";

import { isPreviewable } from "@/components/ide/file-tree";

export function useWorkspaceEffects(
  state: ReturnType<typeof import("./use-home-state").useHomeState>,
  fileOps: ReturnType<typeof import("./use-file-callbacks").useFileCallbacks>,
) {
  const {
    activePathRef,
    openPathsRef,
    contentsRef,
    savedContentsRef,
    previewPathRef,
    setConnected,
    setPreviewNonce,
    setPreviewHtml,
    setPreviewLoading,
    setPreviewPath,
    pushEntry,
    loadFiles,
    activePath,
    files,
    savedContents,
    previewNonce,
  } = state;

  const { reloadFile, closeFile } = fileOps;

  const onWorkspaceEvent = useCallback(
    (event: MessageEvent) => {
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
    },
    [pushEntry, loadFiles, reloadFile, closeFile, setPreviewNonce, activePathRef, openPathsRef, contentsRef, savedContentsRef, previewPathRef],
  );

  useEffect(() => {
    const source = new EventSource("/api/workspace/events");

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);
    source.onmessage = onWorkspaceEvent;

    return () => {
      source.close();
    };
  }, [onWorkspaceEvent, setConnected]);

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
  }, [
    files,
    activePath,
    savedContents,
    previewNonce,
    previewTarget,
    setPreviewPath,
    setPreviewHtml,
    setPreviewLoading,
    previewPathRef,
  ]);
}
