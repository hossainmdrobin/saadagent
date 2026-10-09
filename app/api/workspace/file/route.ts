
import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { projectManager } from "@/lib/workspace/project-manager";
import { workspaceManager } from "@/lib/workspace/workspace-manager";

async function getProjectRoot(project: string | null) {
  if (
    !project ||
    !/^[a-zA-Z0-9_-]+$/.test(project) ||
    !(await projectManager.exists(project))
  ) {
    return null;
  }

  return workspaceManager.getProjectPath(project);
}

function resolveProjectFile(projectRoot: string, file: string) {
  const filePath = path.resolve(projectRoot, file);
  const relativePath = path.relative(projectRoot, filePath);

  if (
    !relativePath ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  return filePath;
}

export async function GET(request: NextRequest) {
  const project = request.nextUrl.searchParams.get("project");
  const file = request.nextUrl.searchParams.get("file");

  if (!file) {
    return Response.json(
      { error: "File is required" },
      { status: 400 }
    );
  }

  const projectRoot = await getProjectRoot(project);

  if (!projectRoot) {
    return Response.json(
      { error: "Invalid or unknown project" },
      { status: 400 }
    );
  }

  const filePath = resolveProjectFile(projectRoot, file);

  if (!filePath) {
    return Response.json(
      { error: "Invalid file path" },
      { status: 403 }
    );
  }

  try {
    const content = await fs.readFile(filePath, "utf-8");

    return Response.json({ file, content });
  } catch {
    return Response.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const project = body.project;
  const file = body.file;
  const content = body.content;

  if (
    typeof file !== "string" ||
    !file ||
    typeof content !== "string"
  ) {
    return Response.json(
      { error: "File and content are required" },
      { status: 400 }
    );
  }

  const projectRoot = await getProjectRoot(project);

  if (!projectRoot) {
    return Response.json(
      { error: "Invalid or unknown project" },
      { status: 400 }
    );
  }

  const filePath = resolveProjectFile(projectRoot, file);

  if (!filePath) {
    return Response.json(
      { error: "Invalid file path" },
      { status: 403 }
    );
  }

  try {
    await fs.writeFile(filePath, content, "utf-8");

    return Response.json({ success: true, file });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to write file",
      },
      { status: 500 }
    );
  }
}