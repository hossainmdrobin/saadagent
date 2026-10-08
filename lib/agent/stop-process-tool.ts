import { tool } from "langchain";
import { z } from "zod";

import { processManager } from "@/lib/sandbox/process-manager";

export const stopProcess = tool(
    async ({ pid }) => {
        try {
            await processManager.stop(pid);

            return [
                "success: true",
                `pid: ${pid}`,
                "process stopped",
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
        name: "stop_process",

        description: `
Stop a running process inside the workspace.

Use this when:
- a development server needs to be stopped
- a previous process needs to be terminated
- a process is no longer needed

You must provide the process PID returned by start_process.
`,

        schema: z.object({
            pid: z.number(),
        }),
    }
);