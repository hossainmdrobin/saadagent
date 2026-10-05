export interface SandboxProcess {
  pid: number;
  stop(): Promise<void>;
}