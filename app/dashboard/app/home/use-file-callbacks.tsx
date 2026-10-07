"use client";

import { useCallback } from "react";

export function useFileCallbacks(
  state: ReturnType<typeof import("./use-home-state").useHomeState>,
) {
  const {
    activePathRef,
    contentsRef,
    loadedRef,
    setActivePath,
    setOpenPaths,
    setContents,
    setSavedContents,
    setSavingPath,
    pushEntry,
    pushToast,
  } = state;

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
  }, [setContents, setSavedContents]);

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
    [setActivePath, setOpenPaths, setContents, setSavedContents, loadedRef],
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
  }, [setOpenPaths, setActivePath, setContents, setSavedContents, activePathRef, loadedRef]);

  const saveFile = useCallback(async (path: string) => {
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
  }, [setSavingPath, setSavedContents, pushEntry, pushToast, contentsRef]);

  return { reloadFile, openFile, closeFile, saveFile };
}
