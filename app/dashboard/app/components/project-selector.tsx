interface Project {
  name: string;
  path: string;
}

interface ProjectSelectorProps {
  projects: Project[];
  selectedProject: string;
  newProjectName: string;
  onProjectChange: (value: string) => void;
  onNewProjectChange: (value: string) => void;
  onCreateProject: () => void;
}

export function ProjectSelector({
  projects,
  selectedProject,
  newProjectName,
  onProjectChange,
  onNewProjectChange,
  onCreateProject,
}: ProjectSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--agent-border)] bg-[var(--agent-bg-elevated)] p-4 shadow-[var(--agent-shadow)]">
      <label
        htmlFor="project-select"
        className="flex items-center gap-2 text-sm font-medium text-[var(--agent-text)]"
      >
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
        Project
      </label>

      <select
        id="project-select"
        value={selectedProject}
        onChange={(event) => onProjectChange(event.target.value)}
        className="rounded-lg border border-[var(--agent-border)] bg-[var(--agent-bg)] px-3 py-2 text-sm text-[var(--agent-text)] outline-none transition-colors focus:border-[var(--agent-primary)]"
      >
        {projects.map((project) => (
          <option key={project.name} value={project.name}>
            {project.name}
          </option>
        ))}
      </select>

      <input
        value={newProjectName}
        onChange={(event) => onNewProjectChange(event.target.value)}
        placeholder="New project name"
        className="min-w-0 flex-1 rounded-lg border border-[var(--agent-border)] bg-[var(--agent-bg)] px-3 py-2 text-sm text-[var(--agent-text)] outline-none transition-colors focus:border-[var(--agent-primary)]"
      />

      <button
        onClick={onCreateProject}
        className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--agent-primary)] to-[var(--agent-accent)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
      >
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
          <path d="M12 5v14M5 12h14" />
        </svg>
        Create Project
      </button>
    </div>
  );
}