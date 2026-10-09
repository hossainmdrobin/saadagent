
import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { projectManager } from "@/lib/workspace/project-manager";
import { workspaceManager } from "@/lib/workspace/workspace-manager";

export async function GET(request: NextRequest) {
    const project = request.nextUrl.searchParams.get("project");

    if (
        !project ||
        !/^[a-zA-Z0-9_-]+$/.test(project) ||
        !(await projectManager.exists(project))
    ) {
        return Response.json(
            { error: "Invalid or unknown project" },
            { status: 400 }
        );
    }

    try {
        const projectRoot = workspaceManager.getProjectPath(project);
        const files = await getFiles(projectRoot);

        return Response.json({ files });
    } catch (error) {
        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to read project files",
            },
            { status: 500 }
        );
    }
}

async function getFiles(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, {
        withFileTypes: true,
    });

    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            const children = await getFiles(fullPath);

            files.push(
                ...children.map((child) => `${entry.name}/${child}`)
            );
        } else {
            files.push(entry.name);
        }
    }

    return files;
}