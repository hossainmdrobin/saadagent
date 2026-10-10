import fs from "fs/promises";
import path from "path";
import { workspaceManager } from "./workspace-manager";

export type Project = {
    name: string;
    path: string;
};

class ProjectManager {
    async list(): Promise<Project[]> {
        const root = workspaceManager.getRoot();

        const entries = await fs.readdir(root, {
            withFileTypes: true,
        });

        return entries
            .filter((entry) => entry.isDirectory())
            .map((entry) => ({
                name: entry.name,
                path: workspaceManager.getProjectPath(
                    entry.name
                ),
            }));
    }

    async create(name: string): Promise<Project> {
        this.validateName(name);

        const projectPath =
            workspaceManager.getProjectPath(name);

        await fs.mkdir(projectPath, {
            recursive: true,
        });

        return {
            name,
            path: projectPath,
        };
    }

    async exists(name: string): Promise<boolean> {
        try {
            const projectPath =
                workspaceManager.getProjectPath(name);

            const stat = await fs.stat(projectPath);

            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    private validateName(name: string) {
        if (!name.trim()) {
            throw new Error("Project name is required");
        }

        if (
            name.includes("/") ||
            name.includes("\\") ||
            name.includes("..")
        ) {
            throw new Error("Invalid project name");
        }
    }
}

export const projectManager =
    new ProjectManager();