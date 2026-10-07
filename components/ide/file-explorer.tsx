"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Columns3,
  Eye,
  EyeOff,
  ListTree,
  Search,
  Table,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  buildFileTree,
  DEFAULT_COLUMN_VISIBILITY,
  FILE_TABLE_COLUMNS,
  flattenTree,
  getFileIcon,
  getFileType,
  getLanguage,
  getParentPath,
  type ColumnVisibility,
  type FileNode,
  type FileTableColumnId,
  type FlatNode,
} from "./file-tree";

type ViewMode = "tree" | "table";

const STORAGE_KEYS = {
  view: "saadagent:explorer:view",
  columns: "saadagent:explorer:columns",
} as const;

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

function filterFlatNodes(nodes: FlatNode[], query: string): FlatNode[] {
  const normalized = query.toLowerCase();

  return nodes.filter(
    ({ node }) =>
      node.name.toLowerCase().includes(normalized) ||
      node.path.toLowerCase().includes(normalized),
  );
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
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibility>(DEFAULT_COLUMN_VISIBILITY);
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const savedView = localStorage.getItem(STORAGE_KEYS.view);

        if (savedView === "tree" || savedView === "table") {
          setViewMode(savedView);
        }

        const savedColumns = localStorage.getItem(STORAGE_KEYS.columns);

        if (savedColumns) {
          const parsed = JSON.parse(savedColumns) as Partial<ColumnVisibility>;

          setColumnVisibility({
            name: parsed.name ?? DEFAULT_COLUMN_VISIBILITY.name,
            type: parsed.type ?? DEFAULT_COLUMN_VISIBILITY.type,
            path: parsed.path ?? DEFAULT_COLUMN_VISIBILITY.path,
          });
        }
      } catch {
      }
    };

    void load();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.view, viewMode);
    } catch {
    }
  }, [viewMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.columns, JSON.stringify(columnVisibility));
    } catch {
    }
  }, [columnVisibility]);

  useEffect(() => {
    if (!columnsMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setColumnsMenuOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(event.target as Node)
      ) {
        setColumnsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [columnsMenuOpen]);

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

  const flatNodes = useMemo(() => flattenTree(visibleTree), [visibleTree]);
  const tableNodes = useMemo(
    () => (query.trim() ? filterFlatNodes(flatNodes, query.trim()) : flatNodes),
    [flatNodes, query],
  );

  const visibleColumns = useMemo(
    () => FILE_TABLE_COLUMNS.filter((column) => columnVisibility[column.id]),
    [columnVisibility],
  );

  const visibleColumnCount = visibleColumns.length;

  const isExpanded = (path: string) =>
    query.trim() !== "" || autoExpanded.has(path) || collapsed[path] !== true;

  const toggleDirectory = (path: string) => {
    setCollapsed((previous) => ({
      ...previous,
      [path]: !isExpanded(path),
    }));
  };

  const toggleColumn = (id: FileTableColumnId) => {
    setColumnVisibility((previous) => {
      const nextVisible = FILE_TABLE_COLUMNS.filter(
        (column) => column.id !== id && previous[column.id],
      ).length;

      if (previous[id] && nextVisible === 0) {
        return previous;
      }

      return { ...previous, [id]: !previous[id] };
    });
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

  const renderTable = () => {
    if (tableNodes.length === 0) {
      return (
        <p className="px-2 py-4 text-xs text-zinc-600">
          {query.trim() ? "No matching files" : "No files in workspace"}
        </p>
      );
    }

    return (
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-white/10 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {visibleColumns.map((column) => (
              <th key={column.id} className="px-2 py-1.5 font-medium">
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {tableNodes.map(({ node, depth }) => {
            const Icon = getFileIcon(node.path, node.type === "directory");
            const isActive = node.type === "file" && node.path === activePath;
            const isDirectory = node.type === "directory";

            return (
              <tr
                key={node.path}
                onClick={() => {
                  if (!isDirectory) {
                    onSelect(node.path);
                  }
                }}
                className={cn(
                  "border-b border-white/[0.04] text-[13px] transition-colors",
                  isActive
                    ? "bg-sky-500/15 text-sky-200"
                    : isDirectory
                      ? "text-zinc-500"
                      : "cursor-pointer text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
                )}
              >
                {columnVisibility.name && (
                  <td
                    className="px-2 py-1.5"
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon
                        className={cn(
                          "size-3.5 shrink-0",
                          isActive
                            ? "text-sky-300"
                            : isDirectory
                              ? "text-sky-400/70"
                              : "text-zinc-500",
                        )}
                      />
                      <span
                        className={cn(
                          "truncate",
                          isDirectory && "font-medium",
                        )}
                      >
                        {node.name}
                      </span>
                    </span>
                  </td>
                )}

                {columnVisibility.type && (
                  <td className="px-2 py-1.5">
                    <span className="rounded border border-white/10 px-1.5 py-px text-[10px] font-medium text-zinc-500">
                      {getFileType(node.path, isDirectory)}
                    </span>
                  </td>
                )}

                {columnVisibility.path && (
                  <td className="max-w-28 truncate px-2 py-1.5 font-mono text-[11px] text-zinc-600">
                    {getParentPath(node.path)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 px-3 pb-2 pt-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Explorer
        </span>

        <span className="ml-auto flex items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.03] p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("tree")}
            title="Tree view"
            aria-label="Tree view"
            className={cn(
              "rounded p-1 transition-colors",
              viewMode === "tree"
                ? "bg-white/10 text-sky-400"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <ListTree className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setViewMode("table")}
            title="Table view"
            aria-label="Table view"
            className={cn(
              "rounded p-1 transition-colors",
              viewMode === "table"
                ? "bg-white/10 text-sky-400"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <Table className="size-3.5" />
          </button>
        </span>

        <div className="relative" ref={columnsMenuRef}>
          <button
            type="button"
            onClick={() => setColumnsMenuOpen((previous) => !previous)}
            title="Toggle columns"
            aria-label="Toggle columns"
            aria-expanded={columnsMenuOpen}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              columnsMenuOpen
                ? "bg-white/10 text-sky-400"
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
            )}
          >
            <Columns3 className="size-3.5" />
          </button>

          {columnsMenuOpen && (
            <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-white/10 bg-[#111826] p-1.5 shadow-2xl">
              <p className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Columns
              </p>

              {FILE_TABLE_COLUMNS.map((column) => {
                const isVisible = columnVisibility[column.id];
                const isLastVisible = isVisible && visibleColumnCount === 1;

                return (
                  <button
                    key={column.id}
                    type="button"
                    onClick={() => toggleColumn(column.id)}
                    disabled={isLastVisible}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                      isLastVisible
                        ? "cursor-not-allowed text-zinc-600"
                        : "text-zinc-300 hover:bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-3.5 items-center justify-center rounded border transition-colors",
                        isVisible
                          ? "border-sky-400 bg-sky-400 text-[#0b0f17]"
                          : "border-zinc-600 bg-transparent",
                      )}
                    >
                      {isVisible && <Check className="size-2.5" />}
                    </span>

                    <span className="flex-1">{column.label}</span>

                    {isVisible ? (
                      <Eye className="size-3 text-zinc-600" />
                    ) : (
                      <EyeOff className="size-3 text-zinc-600" />
                    )}
                  </button>
                );
              })}

              <p className="px-2 pb-1 pt-1.5 text-[10px] leading-relaxed text-zinc-600">
                Applies to the table view.
              </p>
            </div>
          )}
        </div>
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

        {visibleTree.length === 0 && viewMode === "tree" ? (
          <p className="px-2 py-4 text-xs text-zinc-600">
            {query.trim() ? "No matching files" : "No files in workspace"}
          </p>
        ) : viewMode === "table" ? (
          renderTable()
        ) : (
          renderNodes(visibleTree, 0)
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-4 py-2">
        <p className="truncate font-mono text-[10px] text-zinc-600">
          {files.length} {files.length === 1 ? "file" : "files"}
        </p>

        <p className="truncate font-mono text-[10px] text-zinc-600">
          {activePath ? getLanguage(activePath) : "select a file"}
        </p>
      </div>
    </div>
  );
}
