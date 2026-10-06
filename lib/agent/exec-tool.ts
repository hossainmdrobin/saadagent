import { tool } from "langchain";
import { z } from "zod";

import { sandbox } from "@/lib/sandbox/sandbox-manager";

export const runCommand = tool(
  async ({ command, cwd }) => {
    try {
      const result = await sandbox.execute(command, cwd);

      // ALWAYS return plain text to the model.
      return [
        `success: ${result.success}`,
        `stdout: ${result.stdout}`,
        `stderr: ${result.stderr}`,
        `exitCode: ${result.exitCode}`,
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
    name: "run_command",

    description: `
Execute a command inside the project workspace.

Use this for:
- npm test
- npm install
- npm run build
- npm run dev
- checking command output

The cwd must be relative to the workspace.
Examples:
- "demo"
- "demo/src"
- "/demo"

Never use an absolute Windows path.
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