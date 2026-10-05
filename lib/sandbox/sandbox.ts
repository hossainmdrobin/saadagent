export interface SandboxResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface Sandbox {
  start(): Promise<void>;

  execute(
    command: string,
    cwd?: string
  ): Promise<SandboxResult>;

  startProcess(
    command: string,
    cwd?: string
  ): Promise<{
    pid: number;
  }>;

  getWorkspace(): string;

  stop(): Promise<void>;
}