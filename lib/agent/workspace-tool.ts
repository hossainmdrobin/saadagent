import { tool } from "langchain";
import { z } from "zod";

import { LocalSandbox } from "@/lib/sandbox/local-sandbox";

const sandbox = new LocalSandbox(
  `${process.cwd()}/workspace`
);

export const getWorkspaceInfo = tool(
  async () => {
    return JSON.stringify({
      workspace: sandbox.getWorkspace(),
    });
  },
  {
    name: "get_workspace_info",
    description:
      "Get the absolute path of the current project workspace.",
    schema: z.object({}),
  }
);