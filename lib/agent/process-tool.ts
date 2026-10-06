import { tool } from "langchain";
import { z } from "zod";

import { processManager } from "@/lib/sandbox/process-manager";
import { sandbox } from "@/lib/sandbox/sandbox-manager";

export const startProcess = tool(
  async ({ command, cwd }) => {
    try {
      const runningProcess =
        await sandbox.startProcess(command, cwd);

      processManager.add(runningProcess);

      return [
        "success: true",
        `pid: ${runningProcess.pid}`,
        `command: ${command}`,
      ].join("\n");
    } catch (error) {
      return [
        "success: false",
        `error: ${
          error instanceof Error
            ? error.message
            : String(error)
        }`,
      ].join("\n");
    }
  },
  {
    name: "start_process",

    description: `
Start a long-running process inside the project workspace.

Use this for:
- development servers
- preview servers
- processes that must continue running

The cwd must be relative to the workspace.
`,

    schema: z.object({
      command: z.string(),

      cwd: z
        .string()
        .optional()
        .describe(
          "Workspace-relative directory such as 'demo' or '/demo'. Never use an absolute Windows path."
        ),
    }),
  }
);