import fs from "fs/promises";
import path from "path";

const workspace = path.join(process.cwd(), "workspace");

export async function GET() {
  try {
    const files = await getFiles(workspace);

    return Response.json({
      files,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to read workspace",
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
        ...children.map(
          (child) => `${entry.name}/${child}`
        )
      );
    } else {
      files.push(entry.name);
    }
  }

  return files;
}
