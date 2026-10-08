import { tool } from "langchain";
import { z } from "zod";

import { processManager } from "@/lib/sandbox/process-manager";
import { sandbox } from "@/lib/sandbox/sandbox-manager";

export const startProcess = tool(
  async ({ command, cwd, project }) => {
    try {
      const runningProcess =
        await sandbox.startProcess(command, cwd);

      processManager.add(
        runningProcess,
        command,
        cwd,
        project
      );

      return [
        "success: true",
        `pid: ${runningProcess.pid}`,
        `command: ${command}`,
        `project:${project ?? "unknown"}`
      ].join("\n");
    } catch (error) {
      return [
        "success: false",
        `error: ${error instanceof Error
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

When starting a process for a known project,
provide the project name.

Example:

project: "demo"
cwd: "demo"
command: "npm start"
`,

    schema: z.object({
      command: z.string(),

      cwd: z
        .string()
        .optional()
        .describe("Workspace-relative directory such as 'demo' or '/demo'."),
      project: z
        .string()
        .optional()
        .describe("Name of the project this process belongs to, such as 'demo'."),
    }),
  }
);