import { tool } from "langchain";
import { z } from "zod";
import { processManager } from "@/lib/sandbox/process-manager";

export const listProcesses = tool(
  async () => {
    const processes = processManager.list();

    if (processes.length === 0) {
      return "No managed processes are currently running.";
    }

    return JSON.stringify(processes, null, 2);
  },
  {
    name: "list_processes",
    description: `
List all long-running processes currently started by the coding agent.

IMPORTANT:
Before starting a development server or other long-running process,
use this tool to check whether the process is already running.

Use this tool when:
- the user asks what is running
- you need to find a PID
- you need to stop a process
- you are about to start a development server
- you need to check whether a server is already running

If the required server is already running:
- do NOT start another copy
- reuse the existing process
- report its PID

The result contains:
- pid
- command
- cwd
- startedAt
`,
    schema: z.object({}),
  }
);