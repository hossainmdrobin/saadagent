
import { NextRequest, NextResponse } from "next/server";
import { projectManager } from "@/lib/workspace/project-manager";
import { createAgentForProject } from "@/lib/agent/agent";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const project = request.nextUrl.searchParams.get("project");

    if (
        !project ||
        !projectManager.exists(project) ||
        !/^[a-zA-Z0-9_-]+$/.test(id)
    ) {
        return NextResponse.json(
            { error: "Invalid project or conversation ID" },
            { status: 400 }
        );
    }

    const agent = createAgentForProject(project);

    const state = await agent.getState({
        configurable: {
            thread_id: `project-${project}-chat-${id}`,
        },
    });

    const messages = state.values?.messages ?? [];

    return NextResponse.json({
        conversationId: id,
        messages: messages.map((message: any) => ({
            type: message.type,
            content:
                typeof message.content === "string"
                    ? message.content
                    : "",
        })),
    });
}
