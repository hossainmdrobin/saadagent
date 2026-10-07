"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import type { ConsoleEntry, PreviewTab } from "@/components/ide/preview-pane";
import { createEntry } from "./create-entry";

export function useHomeState() {
  const { pushToast } = useToast();

  const [files, setFiles] = useState<string[]>([]);
  const [openPaths, setOpenPaths] = useState<string[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [savedContents, setSavedContents] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [savingPath, setSavingPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorOpen, setEditorOpen] = useState(true);
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

  useEffect(() => {
    const load = async () => {
      await loadFiles();
    };
    void load();
  }, [loadFiles]);

  return {
    files,
    setFiles,
    openPaths,
    setOpenPaths,
    activePath,
    setActivePath,
    contents,
    setContents,
    savedContents,
    setSavedContents,
    prompt,
    setPrompt,
    running,
    setRunning,
    savingPath,
    setSavingPath,
    entries,
    setEntries,
    connected,
    setConnected,
    sidebarOpen,
    setSidebarOpen,
    editorOpen,
    setEditorOpen,
    previewOpen,
    setPreviewOpen,
    tab,
    setTab,
    previewPath,
    setPreviewPath,
    previewHtml,
    setPreviewHtml,
    previewLoading,
    setPreviewLoading,
    previewNonce,
    setPreviewNonce,
    activePathRef,
    openPathsRef,
    contentsRef,
    savedContentsRef,
    loadedRef,
    previewPathRef,
    pushEntry,
    loadFiles,
    pushToast,
  };
}
