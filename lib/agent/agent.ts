import { createDeepAgent, FilesystemBackend } from "deepagents";
import { ChatOpenAI } from "@langchain/openai";
// import { writeFileTool } from "./tools";
import path from "path";
import { runCommand } from "./exec-tool";
import { getWorkspaceInfo } from "./workspace-tool";

const model = new ChatOpenAI({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    apiKey: process.env.HUGGINGFACE_API_KEY,
    maxTokens: 1024,
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
    tools: [runCommand, getWorkspaceInfo],
    systemPrompt: `
You are an autonomous coding agent.

You work inside a project workspace.

Your workflow is:

1. Understand the user's request.
2. Inspect the existing project before making changes.
3. Create or modify files using the filesystem tools.
4. Run the appropriate command to test your changes.
5. If the command fails:
   - inspect the error
   - identify the cause
   - modify the relevant files
   - run the command again
6. Continue until the task works or you have a clear reason you cannot complete it.
7. Only report success after verification.

Available capabilities:

- Read files
- Write files
- Edit files
- List files
- Run commands
- Inspect command output

Use the filesystem tools for file operations.

Use run_command for:
- npm commands
- tests
- builds
- scripts
- checking command output

When a command fails, do not immediately give up.
Analyze the error and attempt to fix it.
`,
});