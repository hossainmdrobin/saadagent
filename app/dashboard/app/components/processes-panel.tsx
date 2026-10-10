interface Process {
  pid: number;
  command: string;
  cwd?: string;
}

interface ProcessesPanelProps {
  processes: Process[];
  onStop: (pid: number) => void;
}

export function ProcessesPanel({
  processes,
  onStop,
}: ProcessesPanelProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--agent-border)] bg-[var(--agent-bg-elevated)] shadow-[var(--agent-shadow)]">
      <div className="flex items-center justify-between border-b border-[var(--agent-border)] px-4 py-3">
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
            <path d="M2 12h20M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20z" />
          </svg>
          Running Processes
        </h2>
        <span className="rounded-full bg-[var(--agent-bg-sunken)] px-2 py-0.5 text-xs text-[var(--agent-text-dim)]">
          {processes.length}
        </span>
      </div>

      <div className="max-h-[320px] space-y-2 overflow-auto p-3">
        {processes.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-[var(--agent-text-dim)]">
              No running processes
            </p>
          </div>
        ) : (
          processes.map((process) => (
            <div
              key={process.pid}
              className="flex items-center justify-between rounded-lg border border-[var(--agent-border)] bg-[var(--agent-bg)] p-3"
            >
              <div className="min-w-0">
                <div className="truncate font-mono text-sm text-[var(--agent-text)]">
                  {process.command}
                </div>
                <div className="text-xs text-[var(--agent-text-dim)]">
                  PID: {process.pid} · {process.cwd ?? "workspace"}
                </div>
              </div>
              <button
                onClick={() => onStop(process.pid)}
                className="ml-3 shrink-0 rounded-lg bg-[var(--agent-error)]/15 px-3 py-1.5 text-xs font-medium text-[var(--agent-error)] transition-colors hover:bg-[var(--agent-error)]/25"
              >
                Stop
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}