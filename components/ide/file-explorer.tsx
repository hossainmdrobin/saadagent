"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  buildFileTree,
  getFileIcon,
  getLanguage,
  type FileNode,
} from "./file-tree";

interface FileExplorerProps {
  files: string[];
  activePath: string | null;
  openPaths: string[];
  onSelect: (path: string) => void;
}

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const normalized = query.toLowerCase();
  const result: FileNode[] = [];

  for (const node of nodes) {
    if (node.type === "file") {
      if (
        node.name.toLowerCase().includes(normalized) ||
        node.path.toLowerCase().includes(normalized)
      ) {
        result.push(node);
      }
      continue;
    }

    const children = filterTree(node.children, query);

    if (children.length > 0 || node.name.toLowerCase().includes(normalized)) {
      result.push({ ...node, children: children.length > 0 ? children : node.children });
    }
  }

  return result;
}

export function FileExplorer({
  files,
  activePath,
  openPaths,
  onSelect,
}: FileExplorerProps) {
  const tree = useMemo(() => buildFileTree(files), [files]);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const autoExpanded = useMemo(() => {
    const expanded = new Set<string>();

    for (const path of openPaths) {
      const segments = path.split("/");
      segments.pop();
      let accumulator = "";

      for (const segment of segments) {
        accumulator = accumulator ? `${accumulator}/${segment}` : segment;
        expanded.add(accumulator);
      }
    }

    return expanded;
  }, [openPaths]);

  const visibleTree = useMemo(
    () => (query.trim() ? filterTree(tree, query.trim()) : tree),
    [tree, query],
  );

  const isExpanded = (path: string) =>
    query.trim() !== "" || autoExpanded.has(path) || collapsed[path] !== true;

  const toggleDirectory = (path: string) => {
    setCollapsed((previous) => ({
      ...previous,
      [path]: !isExpanded(path),
    }));
  };

  const renderNodes = (nodes: FileNode[], depth: number) =>
    nodes.map((node) => {
      const Icon = getFileIcon(node.path, node.type === "directory");
      const isActive = node.type === "file" && node.path === activePath;
      const isOpen = openPaths.includes(node.path);

      if (node.type === "directory") {
        const expanded = isExpanded(node.path);

        return (
          <div key={node.path}>
            <button
              type="button"
              onClick={() => toggleDirectory(node.path)}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
                "text-zinc-300 hover:bg-white/5 hover:text-white",
              )}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
            >
              {expanded ? (
                <ChevronDown className="size-3.5 shrink-0 text-zinc-500" />
              ) : (
                <ChevronRight className="size-3.5 shrink-0 text-zinc-500" />
              )}
              <Icon className="size-3.5 shrink-0 text-sky-400/80" />
              <span className="truncate font-medium">{node.name}</span>
            </button>
            {expanded && renderNodes(node.children, depth + 1)}
          </div>
        );
      }

      return (
        <button
          key={node.path}
          type="button"
          onClick={() => onSelect(node.path)}
          className={cn(
            "flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors",
            isActive
              ? "bg-sky-500/15 text-sky-200"
              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
          )}
          style={{ paddingLeft: `${depth * 14 + 8 + 14}px` }}
        >
          <span className="w-3.5 shrink-0" />
          <Icon
            className={cn(
              "size-3.5 shrink-0",
              isActive ? "text-sky-300" : "text-zinc-500",
            )}
          />
          <span className="truncate">{node.name}</span>
          {isOpen && !isActive && (
            <span className="ml-auto size-1 shrink-0 rounded-full bg-zinc-600" />
          )}
        </button>
      );
    });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Explorer
        </span>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          {files.length} {files.length === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter files..."
            spellCheck={false}
            className="h-8 w-full rounded-md border border-white/10 bg-white/5 pl-8 pr-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-sky-400/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          workspace
        </p>

        {visibleTree.length === 0 ? (
          <p className="px-2 py-4 text-xs text-zinc-600">
            {query.trim() ? "No matching files" : "No files in workspace"}
          </p>
        ) : (
          renderNodes(visibleTree, 0)
        )}
      </div>

      <div className="border-t border-white/5 px-4 py-2">
        <p className="truncate font-mono text-[10px] text-zinc-600">
          {activePath ? getLanguage(activePath) : "select a file"}
        </p>
      </div>
    </div>
  );
}
