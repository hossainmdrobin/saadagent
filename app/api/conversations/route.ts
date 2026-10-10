
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { projectManager } from "@/lib/workspace/project-manager";

// type Conversation = {
//     id: string;
//     project: string;
//     title: string;
//     createdAt: string;
//     updatedAt: string;
// };

// const dataDir = path.join(process.cwd(), "data");
// const filePath = path.join(dataDir, "conversations.json");

// async function readConversations(): Promise<Conversation[]> {
//     await fs.mkdir(dataDir, { recursive: true });

//     try {
//         const content = await fs.readFile(filePath, "utf-8");
//         return JSON.parse(content) as Conversation[];
//     } catch (error) {
//         if (
//             error &&
//             typeof error === "object" &&
//             "code" in error &&
//             error.code === "ENOENT"
//         ) {
//             return [];
//         }

//         throw error;
//     }
// }

// async function writeConversations(
//     conversations: Conversation[]
// ) {
//     await fs.mkdir(dataDir, { recursive: true });

//     await fs.writeFile(
//         filePath,
//         JSON.stringify(conversations, null, 2),
//         "utf-8"
//     );
// }

// GET: List conversations for a project
export async function GET(request: NextRequest) {
    // const project = request.nextUrl.searchParams.get("project");

    // if (!project || !projectManager.exists(project)) {
    //     return NextResponse.json(
    //         { error: "Invalid project" },
    //         { status: 400 }
    //     );
    // }

    // const conversations = await readConversations();

    // const projectConversations = conversations
    //     .filter((chat) => chat.project === project)
    //     .sort(
    //         (a, b) =>
    //             new Date(b.updatedAt).getTime() -
    //             new Date(a.updatedAt).getTime()
    //     );

    return NextResponse.json([]);
}

// POST: Create a new conversation
// export async function POST(request: NextRequest) {
//     const body = await request.json();
//     const project = body.project;

//     if (
//         typeof project !== "string" ||
//         !projectManager.exists(project)
//     ) {
//         return NextResponse.json(
//             { error: "Invalid project" },
//             { status: 400 }
//         );
//     }

//     const now = new Date().toISOString();

//     const conversation: Conversation = {
//         id: randomUUID(),
//         project,
//         title: "New Chat",
//         createdAt: now,
//         updatedAt: now,
//     };

//     const conversations = await readConversations();

//     conversations.push(conversation);

//     await writeConversations(conversations);

//     return NextResponse.json(conversation, { status: 201 });
// }