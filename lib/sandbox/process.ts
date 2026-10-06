export interface SandboxProcess {
  pid: number;

  onStdout(
    callback: (data: string) => void
  ): void;

  onStderr(
    callback: (data: string) => void
  ): void;

  stop(): Promise<void>;
}