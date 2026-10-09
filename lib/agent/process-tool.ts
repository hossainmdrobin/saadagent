
import { tool } from "langchain";
import { z } from "zod";

import { processManager } from "@/lib/sandbox/process-manager";
import type { Sandbox } from "@/lib/sandbox/sandbox";

export function createStartProcessTool(sandbox: Sandbox, projectName: string) {
  return tool(
    async ({ command, cwd }) => {
      try {
        const runningProcess =
          await sandbox.startProcess(command, cwd);

        processManager.add(
          runningProcess,
          command,
          cwd,
          projectName
        );

        return [
          "success: true",
          `pid: ${runningProcess.pid}`,
          `command: ${command}`,
          `project: ${projectName ?? "unknown"}`,
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
Start a long-running process inside the selected project.

Use this for:
- Development servers
- Preview servers
- Processes that must continue running

The cwd must be relative to the selected project's root.
Examples:
- "." (project root)
- "src"

Always provide the selected project name in the project field.
Never use an absolute Windows path.
            `,
      schema: z.object({
        command: z.string(),
        cwd: z
          .string()
          .optional()
          .describe(
            "Directory relative to the selected project's root, such as '.' or 'src'."
          )
      }),
    }
  );
}