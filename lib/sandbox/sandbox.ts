export interface SandboxResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface Sandbox {
  start(): Promise<void>;

  // execute(command: string): Promise<SandboxResult>;
  execute(
    command: string,
    cwd?: string
  ): Promise<SandboxResult>;

  getWorkspace(): string;

  stop(): Promise<void>;
}