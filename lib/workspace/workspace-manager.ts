import path from "path";

class WorkspaceManager {
    private readonly root: string;

    constructor(root: string) {
        this.root = path.resolve(root);
    }

    getRoot() {
        return this.root;
    }

    getProjectPath(projectName: string) {
        return path.join(this.root, projectName);
    }
}

const globalForWorkspace =
    globalThis as unknown as {
        workspaceManager?: WorkspaceManager;
    };

export const workspaceManager =
    globalForWorkspace.workspaceManager ??
    new WorkspaceManager(
        path.join(process.cwd(), "workspace")
    );

if (process.env.NODE_ENV !== "production") {
    globalForWorkspace.workspaceManager =
        workspaceManager;
}