import { createDeepAgent,FilesystemBackend  } from "deepagents";
import { ChatOpenAI } from "@langchain/openai";
// import { writeFileTool } from "./tools";
import path from "path";
import { runCommand } from "./exec-tool";

const model = new ChatOpenAI({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  apiKey:process.env.HUGGINGFACE_API_KEY,
  maxTokens:1024,
  configuration: {
    baseURL: process.env.HUGGINGFACE_BASE_URL?.trim()
  }
});

const workspace = path.join(process.cwd(), "workspace");

const backend = new FilesystemBackend({
  rootDir: workspace,
  virtualMode: true,
});

export const agent = createDeepAgent({
  model,
  backend,
  tools:[runCommand],
  systemPrompt: `
You are a coding agent.

You work inside the user's project workspace.

You can:
- create files
- read files
- modify files
- inspect directories
- run commands

When you modify code, use run_command to test your changes.

Never claim a test or build succeeded unless you actually ran it.
`,
});