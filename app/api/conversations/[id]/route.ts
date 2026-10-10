
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


export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const project = body.project;
    const title = body.title;

    if (
        typeof project !== "string" ||
        !projectManager.exists(project) ||
        !/^[a-zA-Z0-9_-]+$/.test(id) ||
        typeof title !== "string" ||
        !title.trim()
    ) {
        return NextResponse.json(
            { error: "Invalid conversation data" },
            { status: 400 }
        );
    }

    const fs = await import("fs/promises");
    const path = await import("path");

    const filePath = path.join(
        process.cwd(),
        "data",
        "conversations.json"
    );

    let conversations;

    try {
        conversations = JSON.parse(
            await fs.readFile(filePath, "utf-8")
        );
    } catch {
        return NextResponse.json(
            { error: "Conversation metadata not found" },
            { status: 404 }
        );
    }

    const index = conversations.findIndex(
        (chat: { id: string; project: string }) =>
            chat.id === id && chat.project === project
    );

    if (index === -1) {
        return NextResponse.json(
            { error: "Conversation not found" },
            { status: 404 }
        );
    }

    conversations[index].title = title.trim().slice(0, 60);
    conversations[index].updatedAt = new Date().toISOString();

    await fs.writeFile(
        filePath,
        JSON.stringify(conversations, null, 2),
        "utf-8"
    );

    return NextResponse.json(conversations[index]);
}
