import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import type { SandboxProcess } from "./process";
import type { Sandbox, SandboxResult } from "./sandbox";

const execAsync = promisify(exec);

export class LocalSandbox implements Sandbox {
  private readonly workspace: string;

  constructor(workspace: string) {
    this.workspace = path.resolve(workspace);
  }

  private resolveCwd(cwd?: string): string {
    const resolved = cwd
      ? path.resolve(this.workspace, cwd)
      : this.workspace;

    const relative = path.relative(
      this.workspace,
      resolved
    );

    if (
      relative === ".." ||
      relative.startsWith(`..${path.sep}`) ||
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
  ): Promise<SandboxProcess> {
    const workingDirectory =
      this.resolveCwd(cwd);

    const child = spawn(command, {
      cwd: workingDirectory,
      shell: true,
      detached: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const pid = child.pid;

    if (!pid) {
      throw new Error(
        "Failed to start process"
      );
    }

    return Promise.resolve({
      pid,

      onStdout(callback) {
        child.stdout?.on("data", (data) => {
          callback(data.toString());
        });
      },

      onStderr(callback) {
        child.stderr?.on("data", (data) => {
          callback(data.toString());
        });
      },

      async stop() {
        if (process.platform === "win32") {
          spawn("taskkill", [
            "/pid",
            String(pid),
            "/T",
            "/F",
          ]);
        } else {
          process.kill(-pid, "SIGTERM");
        }
      },
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