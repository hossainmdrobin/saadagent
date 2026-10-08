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
List all processes currently started by the coding agent.

Use this before stop_process when you need to
identify a running process and its PID.
`,

        schema: z.object({}),
    }
);