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

      return JSON.stringify({
        success: true,
        pid: runningProcess.pid,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to start process",
      });
    }
  },
  {
    name: "start_process",
    description:
      "Start a long-running process inside the project workspace.",
    schema: z.object({
      command: z.string(),
      cwd: z.string().optional(),
    }),
  }
);