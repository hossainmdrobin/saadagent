
import fs from "fs/promises";
import path from "path";

import {
    BaseMessage,
    // messagesToDict,
    mapStoredMessagesToChatMessages,
    mapChatMessagesToStoredMessages,
} from "@langchain/core/messages";

import { workspaceManager } from "@/lib/workspace/workspace-manager";

function getConversationPath(project: string) {
    return path.join(
        workspaceManager.getProjectPath(project),
        ".saadagent",
        "conversation.json"
    );
}

export async function loadConversation(
    project: string
): Promise<BaseMessage[]> {
    try {
        const content = await fs.readFile(
            getConversationPath(project),
            "utf-8"
        );

        const stored = JSON.parse(content);

        return mapStoredMessagesToChatMessages(stored);
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return [];
        }

        throw error;
    }
}

export async function saveConversation(
    project: string,
    messages: BaseMessage[]
) {
    const filePath = getConversationPath(project);

    await fs.mkdir(path.dirname(filePath), {
        recursive: true,
    });

    const stored = mapChatMessagesToStoredMessages(messages);

    await fs.writeFile(
        filePath,
        JSON.stringify(stored, null, 2),
        "utf-8"
    );
}