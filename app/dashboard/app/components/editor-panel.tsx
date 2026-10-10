interface EditorPanelProps {
  selectedFile: string | null;
  fileContent: string;
  saving: boolean;
  onContentChange: (value: string) => void;
  onSave: () => void;
}

export function EditorPanel({
  selectedFile,
  fileContent,
  saving,
  onContentChange,
  onSave,
}: EditorPanelProps) {
  if (!selectedFile) {
    return (
      <div className="flex h-full w-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-[var(--agent-border)] bg-[var(--agent-bg-elevated)]">
        <div className="text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-2 text-[var(--agent-text-dim)]"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
          </svg>
          <p className="text-sm text-[var(--agent-text-dim)]">
            Select a file to edit
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden w-full rounded-xl border border-[var(--agent-border)] bg-[var(--agent-bg-elevated)] shadow-[var(--agent-shadow)]">
      <div className="flex items-center justify-between border-b border-[var(--agent-border)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[var(--agent-success)]" />
          <span className="font-mono text-sm text-[var(--agent-text)]">
            {selectedFile}
          </span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--agent-primary-soft)] px-3 py-1.5 text-xs font-medium text-[var(--agent-primary)] transition-colors hover:bg-[var(--agent-primary)]/25 disabled:opacity-50"
        >
          {saving ? (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Save
            </>
          )}
        </button>
      </div>

      <textarea
        value={fileContent}
        onChange={(event) => onContentChange(event.target.value)}
        className="min-h-[320px] w-full resize-y bg-[var(--agent-bg)] p-4 font-mono text-sm leading-relaxed text-[var(--agent-text)] outline-none"
        spellCheck={false}
      />
    </div>
  );
}