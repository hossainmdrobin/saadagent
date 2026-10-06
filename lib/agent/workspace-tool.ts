import { tool } from "langchain";
import { z } from "zod";

import { sandbox } from "@/lib/sandbox/sandbox-manager";

export const getWorkspaceInfo = tool(
  async () => {
    try {
      const workspace = sandbox.getWorkspace();

      return `workspace: ${workspace}`;
    } catch (error) {
      return `error: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`;
    }
  },
  {
    name: "get_workspace_info",

    description:
      "Get the absolute path of the current project workspace.",

    schema: z.object({}),
  }
);