// import { LocalSandbox } from "./local-sandbox";
// import type { Sandbox } from "./sandbox";

// const workspace = `${process.cwd()}/workspace`;

// export const sandbox: Sandbox = new LocalSandbox(
//   workspace
// );


import path from "path";
import { LocalSandbox } from "./local-sandbox";
import type { Sandbox } from "./sandbox";
import { workspaceManager } from "@/lib/workspace/workspace-manager";

const workspace = path.join(process.cwd(), "workspace");

// Existing global sandbox — keep it for now.
export const sandbox: Sandbox = new LocalSandbox(workspace);

// Create a sandbox rooted at one specific project.
export function createSandboxForProject(
    projectName: string
): Sandbox {
    if (
        !projectName.trim() ||
        projectName.includes("/") ||
        projectName.includes("\\") ||
        projectName.includes("..")
    ) {
        throw new Error("Invalid project name");
    }

    const projectPath =
        workspaceManager.getProjectPath(projectName);

    return new LocalSandbox(projectPath);
}