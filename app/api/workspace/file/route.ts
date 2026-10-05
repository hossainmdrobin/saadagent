import fs from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

const workspace = path.resolve(
  process.cwd(),
  "workspace"
);

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get("file");

  if (!file) {
    return Response.json(
      { error: "File is required" },
      { status: 400 }
    );
  }

  const filePath = path.resolve(workspace, file);

  // Prevent accessing files outside workspace
  if (!filePath.startsWith(workspace)) {
    return Response.json(
      { error: "Invalid file path" },
      { status: 403 }
    );
  }

  try {
    const content = await fs.readFile(
      filePath,
      "utf-8"
    );

    return Response.json({
      file,
      content,
    });
  } catch {
    return Response.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
