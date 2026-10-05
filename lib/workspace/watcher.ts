import fs from "fs";
import path from "path";

export type WorkspaceEvent =
    | {
        type: "created";
        path: string;
    }
    | {
        type: "changed";
        path: string;
    }
    | {
        type: "deleted";
        path: string;
    };

const workspace = path.resolve(
    process.cwd(),
    "workspace"
);

export function watchWorkspace(
    callback: (event: WorkspaceEvent) => void
) {
    const watcher = fs.watch(
        workspace,
        {
            recursive: true,
        },
        (eventType, filename) => {
            if (!filename) return;

            const filePath = path.join(
                workspace,
                filename.toString()
            );

            if (eventType === "change") {
                callback({
                    type: "changed",
                    path: filename.toString(),
                });

                return;
            }

            if (eventType === "rename") {
                if (fs.existsSync(filePath)) {
                    callback({
                        type: "created",
                        path: filename.toString(),
                    });
                } else {
                    callback({
                        type: "deleted",
                        path: filename.toString(),
                    });
                }
            }
        }
    );

    return () => {
        watcher.close();
    };
}