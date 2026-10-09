
import { tool } from "langchain";
import { z } from "zod";
import { processManager } from "@/lib/sandbox/process-manager";

export function createListProcessesTool(projectName: string) {
    return tool(
        async () => {
            const processes = processManager
                .list()
                .filter((process) => process.project === projectName);

            if (processes.length === 0) {
                return `No managed processes are currently running for project "${projectName}".`;
            }

            return JSON.stringify(processes, null, 2);
        },
        {
            name: "list_processes",
            description: `
List long-running processes belonging to the selected project "${projectName}".

Before starting a development server:
- Check whether it is already running.
- Do not start a duplicate server.
- Reuse an existing process when appropriate.

Only processes belonging to this project are listed.
            `,
            schema: z.object({}),
        }
    );
}