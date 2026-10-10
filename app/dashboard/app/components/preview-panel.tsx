interface PreviewPanelProps {
  url: string;
}

export function PreviewPanel({ url }: PreviewPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--agent-border)] bg-[var(--agent-bg-elevated)] shadow-[var(--agent-shadow)]">
      <div className="flex items-center justify-between border-b border-[var(--agent-border)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[var(--agent-primary)]"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="text-sm font-medium text-[var(--agent-text)]">
            Live Preview
          </span>
        </div>
        <span className="max-w-[220px] truncate font-mono text-xs text-[var(--agent-text-dim)]">
          {url}
        </span>
      </div>
      <iframe
        src={url}
        title="Live Preview"
        className="h-[600px] w-full border-0"
      />
    </div>
  );
}