interface AgentInputProps {
  prompt: string;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onRun: () => void;
}

export function AgentInput({
  prompt,
  loading,
  onPromptChange,
  onRun,
}: AgentInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      if (!loading && prompt.trim()) onRun();
    }
  };

  return (
    <div className="rounded-xl border border-[var(--agent-border)] bg-[var(--agent-bg-elevated)] p-4 shadow-[var(--agent-shadow)]">
      <div className="flex items-center justify-between">
        <label
          htmlFor="agent-prompt"
          className="flex items-center gap-2 text-sm font-semibold text-[var(--agent-text)]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 1V3M12 21V19M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h3M21 12h3M6.34 17.66l-1.42 1.42M19.07 4.93l-1.42 1.42" />
            <circle cx="12" cy="12" r="5" />
          </svg>
          Prompt
        </label>
        <span className="text-xs text-[var(--agent-text-dim)]">
          Cmd/Ctrl + Enter to run
        </span>
      </div>

      <textarea
        id="agent-prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask the coding agent to build, fix, or refactor..."
        rows={4}
        className="mt-3 w-full resize-y rounded-lg border border-[var(--agent-border)] bg-[var(--agent-bg)] p-3 text-sm text-[var(--agent-text)] outline-none transition-colors focus:border-[var(--agent-primary)] focus:ring-2 focus:ring-[var(--agent-primary)]/20"
      />

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[var(--agent-text-muted)]">
          <span className="flex h-2 w-2 rounded-full bg-[var(--agent-primary)]" />
          Agent is ready
        </div>
        <button
          onClick={onRun}
          disabled={loading || !prompt.trim()}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--agent-primary)] to-[var(--agent-accent)] px-5 py-2 text-sm font-semibold text-white shadow-lg transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Running...
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              Run Agent
            </>
          )}
        </button>
      </div>
    </div>
  );
}