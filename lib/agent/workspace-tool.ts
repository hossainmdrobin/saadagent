import { tool } from "langchain";
import { z } from "zod";
import { workspaceManager } from "@/lib/workspace/workspace-manager";

export const getWorkspaceInfo = tool(
  async ({ project }) => {
    try {
      if (project) {
        return JSON.stringify({
          workspace: workspaceManager.getRoot(),
          project,
          projectPath:
            workspaceManager.getProjectPath(project),
        });
      }

      return JSON.stringify({
        workspace: workspaceManager.getRoot(),
      });
    } catch (error) {
      return JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : String(error),
      });
    }
  },
  {
    name: "get_workspace_info",
    description: `
Get information about the coding workspace.

Use this when you need to understand where
the current project is located.

If a project name is known, provide it.

Example:

project: "demo"

Returns:
- workspace root
- project name
- project path
`,
    schema: z.object({
      project: z.string().optional(),
    }),
  }
);