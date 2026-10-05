export interface SandboxResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface Sandbox {
  execute(command: string): Promise<SandboxResult>;
  getWorkspace():string;
}