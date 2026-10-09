
import { tool } from "langchain";
import { z } from "zod";
import type { Sandbox } from "@/lib/sandbox/sandbox";

export function createRunCommandTool(sandbox: Sandbox) {
  return tool(
    async ({ command, cwd }) => {
      try {
        const result = await sandbox.execute(command, cwd);

        return [
          `success: ${result.success}`,
          `stdout: ${result.stdout}`,
          `stderr: ${result.stderr}`,
          `exitCode: ${result.exitCode}`,
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
      name: "run_command",
      description: `
Execute a short-lived command inside the selected project.

Use this for:
- npm test
- npm install
- npm run build
- Checking command output

The cwd must be relative to the selected project's root.
Examples:
- "." (project root)
- "src"
- "src/components"

Never use an absolute Windows path.
            `,
      schema: z.object({
        command: z.string(),
        cwd: z
          .string()
          .optional()
          .describe(
            "Directory relative to the selected project's root, such as '.' or 'src'. Never use an absolute Windows path."
          ),
      }),
    }
  );
}