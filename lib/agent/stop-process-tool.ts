
import { tool } from "langchain";
import { z } from "zod";
import { processManager } from "@/lib/sandbox/process-manager";

export function createStopProcessTool(projectName: string) {
    return tool(
        async ({ pid }) => {
            try {
                const managedProcess = processManager.get(pid);

                if (!managedProcess) {
                    return `success: false\nerror: Process ${pid} was not found.`;
                }

                if (managedProcess.project !== projectName) {
                    return [
                        "success: false",
                        `error: Process ${pid} does not belong to project "${projectName}".`,
                    ].join("\n");
                }

                await processManager.stop(pid);

                return [
                    "success: true",
                    `pid: ${pid}`,
                    `project: ${projectName}`,
                    "process stopped",
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
            name: "stop_process",
            description: `
Stop a running process belonging to the selected project "${projectName}".

Only stop processes listed for this project.
You must provide the PID returned by start_process.
            `,
            schema: z.object({
                pid: z.number(),
            }),
        }
    );
}