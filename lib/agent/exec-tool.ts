import { tool } from "langchain";
import { z } from "zod";

import { LocalSandbox } from "@/lib/sandbox/local-sandbox";

const sandbox = new LocalSandbox(
  `${process.cwd()}/workspace`
);

export const runCommand = tool(
  async ({ command }) => {
    const result = await sandbox.execute(command);

    return JSON.stringify(result);
  },
  {
    name: "run_command",
    description:
      "Execute a command inside the project workspace. Use this for tests, builds, package installation, and inspecting command output.",
    schema: z.object({
      command: z.string(),
    }),
  }
);