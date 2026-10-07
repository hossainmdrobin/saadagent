import {
  Braces,
  File,
  FileCode,
  FileText,
  Folder,
  Globe,
  Image,
  LayoutTemplate,
  type LucideIcon,
} from "lucide-react";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: FileNode[];
}

export function buildFileTree(paths: string[]): FileNode[] {
  const root: FileNode[] = [];

  for (const rawPath of paths) {
    const segments = rawPath.replace(/\\/g, "/").split("/").filter(Boolean);
    let level = root;
    let currentPath = "";

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i] as string;
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
      const isFile = i === segments.length - 1;

      let node = level.find((candidate) => candidate.name === segment);

      if (!node) {
        node = {
          name: segment,
          path: currentPath,
          type: isFile ? "file" : "directory",
          children: [],
        };
        level.push(node);
      }

      level = node.children;
    }
  }

  return sortNodes(root);
}

function sortNodes(nodes: FileNode[]): FileNode[] {
  for (const node of nodes) {
    sortNodes(node.children);
  }

  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });
}

export function getBaseName(path: string): string {
  return path.split("/").pop() ?? path;
}

export function getDirectoryPath(path: string): string | null {
  const segments = path.split("/");
  segments.pop();
  return segments.length > 0 ? segments.join("/") : null;
}

export type Language =
  | "javascript"
  | "typescript"
  | "json"
  | "css"
  | "html"
  | "markdown"
  | "plaintext";

const EXTENSION_LANGUAGES: Record<string, Language> = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  json: "json",
  css: "css",
  scss: "css",
  html: "html",
  htm: "html",
  svg: "html",
  md: "markdown",
  mdx: "markdown",
};

export function getLanguage(path: string): Language {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_LANGUAGES[extension] ?? "plaintext";
}

export function isPreviewable(path: string): boolean {
  return /\.(html?|svg)$/i.test(path);
}

export function getFileIcon(path: string, isDirectory = false): LucideIcon {
  if (isDirectory) {
    return Folder;
  }

  const extension = path.split(".").pop()?.toLowerCase() ?? "";

  if (extension === "json") {
    return Braces;
  }

  if (extension === "html" || extension === "htm" || extension === "svg") {
    return Globe;
  }

  if (extension === "css" || extension === "scss") {
    return LayoutTemplate;
  }

  if (
    extension === "png" ||
    extension === "jpg" ||
    extension === "jpeg" ||
    extension === "gif" ||
    extension === "webp" ||
    extension === "ico"
  ) {
    return Image;
  }

  if (
    extension === "js" ||
    extension === "jsx" ||
    extension === "ts" ||
    extension === "tsx" ||
    extension === "mjs" ||
    extension === "cjs" ||
    extension === "mts"
  ) {
    return FileCode;
  }

  if (extension === "md" || extension === "mdx" || extension === "txt") {
    return FileText;
  }

  return File;
}
