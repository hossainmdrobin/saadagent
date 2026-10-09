import { NextRequest } from "next/server";
import { createAgentForProject } from "@/lib/agent/agent";
import { AgentEvent } from "@/lib/agent/events";
import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { projectManager } from "@/lib/workspace/project-manager";
import { workspaceManager } from "@/lib/workspace/workspace-manager";

function encode(event: AgentEvent) {
    return new TextEncoder().encode(
        JSON.stringify(event) + "\n"
    );
}

function isAIMessage(
    message: BaseMessage
): message is AIMessage {
    return message instanceof AIMessage;
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const prompt = body.prompt;
    const project = body.project;
    if (
        typeof project !== "string" ||
        !(await projectManager.exists(project))
    ) {
        return Response.json(
            {
                error: "Invalid or unknown project",
            },
            { status: 400 }
        );
    }

    const projectPath = workspaceManager.getProjectPath(project);
    const agent = createAgentForProject(project);

    const stream = await agent.stream(
        {
            messages: [
                {
                    role: "user",
                    content: `
                        Selected project: ${project}
                        Project directory: ${projectPath}

                        User request:
                        ${prompt}

                        Important:
                        - Work only inside the selected project.
                        - Treat the selected project directory as the root of this project.
                        - Do not modify files in other projects.
                `.trim(),
                },
            ],
        },
        {
            streamMode: "updates",
        }
    );

    const readable = new ReadableStream({
        async start(controller) {
            try {
                controller.enqueue(
                    encode({
                        type: "thinking",
                    })
                );

                for await (const chunk of stream) {
                    if (chunk.model_request) {
                        const messages = chunk.model_request.messages;

                        for (const message of messages) {
                            if (!isAIMessage(message)) {
                                continue;
                            }
                            if (message.tool_calls?.length) {
                                for (const call of message.tool_calls) {
                                    controller.enqueue(
                                        encode({
                                            type: "tool_call",
                                            tool: call.name,
                                            args: call.args,
                                        })
                                    );
                                }
                            }

                            if (
                                typeof message.content === "string" &&
                                message.content
                            ) {
                                controller.enqueue(
                                    encode({
                                        type: "message",
                                        content: message.content,
                                    })
                                );
                            }
                        }
                    }

                    if (chunk.tools) {
                        for (const message of chunk.tools.messages) {
                            controller.enqueue(
                                encode({
                                    type: "tool_result",
                                    tool: message.name ?? "unknown",
                                    result: message.content,
                                })
                            );
                        }
                    }
                }

                controller.enqueue(
                    encode({
                        type: "done",
                    })
                );

                controller.close();
            } catch (error) {
                controller.enqueue(
                    encode({
                        type: "error",
                        message:
                            error instanceof Error
                                ? error.message
                                : "Unknown agent error",
                    })
                );

                controller.close();
            }
        },
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "application/x-ndjson",
            "Cache-Control": "no-cache",
        },
    });
}