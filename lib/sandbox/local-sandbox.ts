import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { spawn } from "child_process";

import type { Sandbox, SandboxResult } from "./sandbox";

const execAsync = promisify(exec);

export class LocalSandbox implements Sandbox {
  private readonly workspace: string;

  constructor(workspace: string) {
    this.workspace = path.resolve(workspace);
  }

  private resolveCwd(cwd?: string): string {
    const resolved = path.resolve(
      this.workspace,
      cwd ?? "."
    );

    const relative = path.relative(
      this.workspace,
      resolved
    );

    if (
      relative.startsWith("..") ||
      path.isAbsolute(relative)
    ) {
      throw new Error(
        "Working directory is outside the workspace"
      );
    }

    return resolved;
  }

  startProcess(
  command: string,
  cwd?: string
): Promise<{ pid: number }> {
  const workingDirectory =
    this.resolveCwd(cwd);

  const child = spawn(command, {
    cwd: workingDirectory,
    shell: true,
    detached: true,
    stdio: "ignore",
  });

  child.unref();

  return Promise.resolve({
    pid: child.pid!,
  });
}

  async start(): Promise<void> {
    // Nothing to start for local sandbox.
  }

  getWorkspace(): string {
    return this.workspace;
  }

  async execute(
    command: string,
    cwd?: string
  ): Promise<SandboxResult> {
    try {
      const workingDirectory =
        this.resolveCwd(cwd);

      const { stdout, stderr } =
        await execAsync(command, {
          cwd: workingDirectory,
          timeout: 30_000,
        });

      return {
        success: true,
        stdout,
        stderr,
        exitCode: 0,
      };
    } catch (error: any) {
      return {
        success: false,
        stdout: error.stdout ?? "",
        stderr:
          error.stderr ??
          error.message ??
          "",
        exitCode: error.code ?? null,
      };
    }
  }

  async stop(): Promise<void> {
    // Nothing to clean up for local sandbox.
  }
}