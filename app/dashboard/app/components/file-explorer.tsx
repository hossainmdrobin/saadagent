interface FileExplorerProps {
  files: string[];
  selectedFile: string | null;
  onFileClick: (file: string) => void;
}

export function FileExplorer({
  files,
  selectedFile,
  onFileClick,
}: FileExplorerProps) {
  return (
    <div className="rounded-xl border border-[var(--agent-border)] bg-[var(--agent-bg-elevated)] shadow-[var(--agent-shadow)]">
      <div className="flex items-center justify-between border-b border-[var(--agent-border)] p-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--agent-text)]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Workspace
        </h2>
        <span className="rounded-full bg-[var(--agent-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--agent-primary)]">
          {files.length}
        </span>
      </div>

      <div className="max-h-80 overflow-auto">
        {files.length === 0 ? (
          <p className="p-4 text-sm text-[var(--agent-text-dim)]">
            No files yet
          </p>
        ) : (
          <div className="space-y-0.5 p-2">
            {files.map((file) => {
              const isActive = selectedFile === file;
              return (
                <button
                  key={file}
                  onClick={() => onFileClick(file)}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[var(--agent-primary-soft)] text-[var(--agent-primary)]"
                      : "text-[var(--agent-text-muted)] hover:bg-[var(--agent-bg-sunken)]"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                  <span className="truncate font-mono text-xs">{file}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}