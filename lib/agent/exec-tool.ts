import { tool } from "langchain";
import { z } from "zod";

import { LocalSandbox } from "@/lib/sandbox/local-sandbox";

const sandbox = new LocalSandbox(
  `${process.cwd()}/workspace`
);

export const runCommand = tool(
  async ({ command, cwd }) => {
    const result = await sandbox.execute(
      command,
      cwd
    );

    return JSON.stringify(result);
  },
  {
    name: "run_command",
    description:
      "Execute a command inside the project workspace. Use this for tests, builds, package installation, and inspecting command output.",
    schema: z.object({
      command: z.string(),
      cwd: z
        .string()
        .optional()
        .describe(
          "Working directory relative to the project workspace"
        ),
    }),
  }
);