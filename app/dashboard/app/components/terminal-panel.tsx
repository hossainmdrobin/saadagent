interface TerminalPanelProps {
  output: string[];
}

export function TerminalPanel({ output }: TerminalPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--agent-border)] bg-[var(--agent-bg-sunken)] shadow-[var(--agent-shadow)]">
      <div className="flex items-center justify-between border-b border-[var(--agent-border)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--agent-error)]" />
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--agent-warning)]" />
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--agent-success)]" />
          <span className="ml-2 font-mono text-xs text-[var(--agent-text-dim)]">
            terminal
          </span>
        </div>
        <span className="text-xs text-[var(--agent-text-dim)]">
          {output.length} lines
        </span>
      </div>
      <pre className="max-h-[260px] overflow-auto p-4 font-mono text-xs leading-relaxed text-[var(--agent-text)]">
        {output.length > 0
          ? output.join("")
          : <span className="text-[var(--agent-text-dim)]">$ ready to execute...</span>}
      </pre>
    </div>
  );
}