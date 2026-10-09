import { createDeepAgent, FilesystemBackend } from "deepagents";
// import { writeFileTool } from "./tools";
import path from "path";
import { runCommand } from "./exec-tool";
import { getWorkspaceInfo } from "./workspace-tool";
import { startProcess } from "./process-tool";
import { stopProcess } from "./stop-process-tool";
import { listProcesses } from "./list-process-tool";
import { prompt } from "./systemPrompt";

import { ChatOpenAI } from "@langchain/openai";
const model = new ChatOpenAI({
    model: "gc/grok-4.6",
    temperature: 0,
    apiKey: process.env.OMNIROUTE_API_KEY,
    maxTokens: 1024,
    configuration: {
        baseURL: process.env.OMNIROUTE_BASE_URL?.trim()
    }
});
// import { ChatOllama } from "@langchain/ollama"

// const model = new ChatOllama({
//     model: "qwen3:1.7b",              // Ensure you've pulled this model via `ollama pull`
//     temperature: 0,
// });

const workspace = path.join(process.cwd(), "workspace");

const backend = new FilesystemBackend({
    rootDir: workspace,
    virtualMode: true,
});

export const agent = createDeepAgent({
    model,
    backend,
    tools: [
        runCommand,
        startProcess,
        listProcesses,
        stopProcess,
        getWorkspaceInfo,
    ],
    systemPrompt: prompt,
});