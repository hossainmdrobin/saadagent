import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--agent-primary)] to-[var(--agent-accent)] text-white shadow-lg">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--agent-text)]">
            SaadAgent
          </h1>
          <p className="text-xs text-[var(--agent-text-dim)]">
            AI coding agent
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-[var(--agent-success)]/15 px-2.5 py-1 text-xs font-medium text-[var(--agent-success)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--agent-success)] animate-status-dot" />
          Online
        </span>
        <ThemeToggle />
      </div>
    </header>
  );
}