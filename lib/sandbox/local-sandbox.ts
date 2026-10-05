import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

import type { Sandbox, SandboxResult } from "./sandbox";

const execAsync = promisify(exec);

export class LocalSandbox implements Sandbox {
  private readonly workspace: string;

  constructor(workspace: string) {
    this.workspace = path.resolve(workspace);
  }

  getWorkspace(): string {
    return this.workspace;
  }

  async execute(command: string): Promise<SandboxResult> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.workspace,
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
        stderr: error.stderr ?? error.message ?? "",
        exitCode: error.code ?? null,
      };
    }
  }
}