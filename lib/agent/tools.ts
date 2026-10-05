import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const WORKSPACE = path.join(process.cwd(), "workspace");

export const writeFileTool = tool(
  async ({ filePath, content }) => {
    const fullPath = path.join(WORKSPACE, filePath);

    await fs.mkdir(path.dirname(fullPath), {
      recursive: true,
    });

    await fs.writeFile(fullPath, content, "utf-8");

    return `File created: ${filePath}`;
  },
  {
    name: "write_file_custom",
    description:
      "Create or overwrite a file inside the coding workspace.",
    schema: z.object({
      filePath: z.string().describe("Relative path inside the workspace"),
      content: z.string().describe("Content to write into the file"),
    }),
  }
);