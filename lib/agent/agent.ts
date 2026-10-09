
// import { ChatOllama } from "@langchain/ollama"

// const model = new ChatOllama({
//     model: "qwen3:1.7b",              // Ensure you've pulled this model via `ollama pull`
//     temperature: 0,
// });


import { createDeepAgent, FilesystemBackend } from "deepagents";
import path from "path";

import { createRunCommandTool } from "./exec-tool";
import { createStartProcessTool } from "./process-tool";
import { getWorkspaceInfo } from "./workspace-tool";
import { createStopProcessTool } from "./stop-process-tool";
import { createListProcessesTool } from "./list-process-tool";
import { prompt } from "./systemPrompt";

import { createSandboxForProject } from "@/lib/sandbox/sandbox-manager";
import { workspaceManager } from "@/lib/workspace/workspace-manager";
import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({
    model: "gc/grok-4.7",
    temperature: 0,
    apiKey: process.env.OMNIROUTE_API_KEY,
    maxTokens: 1024,
    configuration: {
        baseURL: process.env.OMNIROUTE_BASE_URL?.trim(),
    },
});

export function createAgentForProject(projectName: string): ReturnType<typeof createDeepAgent> {
    const projectPath = workspaceManager.getProjectPath(projectName);
    const projectSandbox = createSandboxForProject(projectName);

    const backend = new FilesystemBackend({
        rootDir: projectPath,
        virtualMode: true,
    });

    return createDeepAgent({
        model,
        backend,
        tools: [
            createRunCommandTool(projectSandbox),
            createStartProcessTool(projectSandbox, projectName),
            createListProcessesTool(projectName),
            createStopProcessTool(projectName),
            getWorkspaceInfo,
        ],
        systemPrompt: `
${prompt}

Selected project: ${projectName}
Project root: ${projectPath}

Important:
- Work only within the selected project's root.
- Use paths relative to this project root.
- Run commands relative to this project root.
- Never access or modify sibling projects.
        `,
    });
}