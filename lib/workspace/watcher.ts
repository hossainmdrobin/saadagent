
import fs from "fs";
import path from "path";
import { workspaceManager } from "@/lib/workspace/workspace-manager";

export type WorkspaceEvent =
    | { type: "created"; path: string }
    | { type: "changed"; path: string }
    | { type: "deleted"; path: string };

export function watchWorkspace(
    projectName: string,
    callback: (event: WorkspaceEvent) => void
) {
    const projectRoot = path.resolve(
        workspaceManager.getProjectPath(projectName)
    );

    const watcher = fs.watch(
        projectRoot,
        { recursive: true },
        (eventType, filename) => {
            if (!filename) return;

            const relativePath = filename.toString();
            const filePath = path.resolve(
                projectRoot,
                relativePath
            );

            // Prevent paths from escaping the project.
            const relative = path.relative(projectRoot, filePath);

            if (
                !relative ||
                relative === ".." ||
                relative.startsWith(`..${path.sep}`) ||
                path.isAbsolute(relative)
            ) {
                return;
            }

            if (eventType === "change") {
                callback({
                    type: "changed",
                    path: relativePath,
                });
                return;
            }

            if (eventType === "rename") {
                if (fs.existsSync(filePath)) {
                    callback({
                        type: "created",
                        path: relativePath,
                    });
                } else {
                    callback({
                        type: "deleted",
                        path: relativePath,
                    });
                }
            }
        }
    );

    return () => watcher.close();
}