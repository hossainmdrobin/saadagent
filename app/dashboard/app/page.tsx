
"use client";

import "./components/theme.css";

import { useEffect, useRef, useState } from "react";

import ChatComponent from "./ChatComponent";
import { AgentEvent } from "./types";
import { ThemeProvider } from "./components/theme-context";
import { AppHeader } from "./components/app-header";
import { AgentInput } from "./components/agent-input";
import { ProjectSelector } from "./components/project-selector";
import { FileExplorer } from "./components/file-explorer";
import { EditorPanel } from "./components/editor-panel";
import { TerminalPanel } from "./components/terminal-panel";
import { PreviewPanel } from "./components/preview-panel";
import { ProcessesPanel } from "./components/processes-panel";
import { ChatHistory } from "./ChatHistory";

import { useListProjectsQuery } from "@/store/features/projects-api";
import {
    useOpenFileQuery,
    useSaveFileMutation,
} from "@/store/features/file-api";

import {
    useCreateConversationMutation,
    useGetConversationsByIdQuery,
    useGetConversationsQuery,
} from "@/store/features/conversation-api";

type Conversation = {
    id: string;
    project: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

function generateConversationTitle(prompt: string) {
    const cleaned = prompt.trim().replace(/\s+/g, " ");

    if (!cleaned) return "New Chat";

    return cleaned.length > 45
        ? `${cleaned.slice(0, 45)}...`
        : cleaned;
}

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<string[]>([]);
    const [isCode, setIsCode] = useState(false);

    const [conversationId, setConversationId] = useState("");

    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState("");

    const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
    const [processes, setProcesses] = useState<any[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [selectedProject, setSelectedProject] = useState("demo");
    const [newProjectName, setNewProjectName] = useState("");

    const selectedFileRef = useRef<string | null>(null);

    // Project and file APIs
    const { data } = useListProjectsQuery();

    const { data: openedFile } = useOpenFileQuery({
        project: selectedProject,
        file: selectedFile || "",
    });

    const [saveFile, { isLoading: saving }] = useSaveFileMutation();

    // Conversation APIs
    const {
        data: conversations,
        refetch: refetchConversations,
    } = useGetConversationsQuery({
        project: selectedProject,
    });

    const [createConversation] = useCreateConversationMutation();

    const { data: selectedChatData } = useGetConversationsByIdQuery(
        {
            id: conversationId,
            project: selectedProject,
        },
        {
            skip: !conversationId,
        }
    );

    // Reset the selected conversation when changing projects.
    useEffect(() => {
        setConversationId("");
        setEvents([]);
        setPrompt("");
        setTerminalOutput([]);
    }, [selectedProject]);

    // Select the latest existing conversation.
    useEffect(() => {
        if (!conversationId && conversations?.length) {
            setConversationId(conversations[0].id);
        }
    }, [conversations, conversationId]);

    // Restore saved messages when a conversation is selected.
    useEffect(() => {
        if (!conversationId || !selectedChatData) return;

        // Prevent showing another conversation's cached response.
        if (selectedChatData.conversationId !== conversationId) return;

        const savedMessages = selectedChatData.messages ?? [];

        const restoredEvents = savedMessages
            .filter(
                (message: { type: string; content: string }) =>
                    typeof message.content === "string" &&
                    message.content.length > 0
            )
            .map(
                (message: { type: string; content: string }) => ({
                    type: "message",
                    content: message.content,
                })
            );

        setEvents(restoredEvents as AgentEvent[]);
    }, [selectedChatData, conversationId]);

    // Load workspace files when the project changes.
    useEffect(() => {
        void loadFiles();
        setSelectedFile(null);
        selectedFileRef.current = null;
        setFileContent("");
    }, [selectedProject]);

    // Keep the selected-file ref in sync.
    useEffect(() => {
        selectedFileRef.current = selectedFile;
    }, [selectedFile]);

    // Workspace events: terminal, processes, preview and file changes.
    useEffect(() => {
        const source = new EventSource(
            `/api/workspace/events?project=${encodeURIComponent(
                selectedProject
            )}`
        );

        source.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === "process_output") {
                    setTerminalOutput((previous) => [
                        ...previous,
                        data.data,
                    ]);
                    return;
                }

                if (data.type === "processes") {
                    setProcesses(data.processes);
                    return;
                }

                if (data.type === "preview") {
                    setPreviewUrl(data.url);
                    return;
                }

                if (
                    data.type === "created" ||
                    data.type === "changed" ||
                    data.type === "deleted"
                ) {
                    await loadFiles();

                    const currentFile = selectedFileRef.current;

                    if (
                        data.type === "deleted" &&
                        data.path === currentFile
                    ) {
                        selectedFileRef.current = null;
                        setSelectedFile(null);
                        setFileContent("");
                    }
                }
            } catch (error) {
                console.error("Workspace event error:", error);
            }
        };

        source.onerror = (error) => {
            console.error("Workspace event connection error:", error);
        };

        return () => {
            source.close();
        };
    }, [selectedProject]);

    async function loadFiles() {
        try {
            const response = await fetch(
                `/api/workspace?project=${encodeURIComponent(
                    selectedProject
                )}`
            );

            if (!response.ok) {
                throw new Error("Failed to load workspace files");
            }

            const result = await response.json();
            setFiles(result.files ?? []);
        } catch (error) {
            console.error("Load files error:", error);
        }
    }

    function handleSelectConversation(id: string) {
        if (id === conversationId) return;

        setConversationId(id);
        setEvents([]);
        setPrompt("");
        setTerminalOutput([]);
    }

    // Create a conversation and select it.
    async function handleNewChat() {
        try {
            const conversation = (await createConversation({
                project: selectedProject,
            }).unwrap()) as Conversation;

            setConversationId(conversation.id);
            setEvents([]);
            setPrompt("");
            setTerminalOutput([]);

            await refetchConversations();
        } catch (error) {
            console.error("Failed to create conversation:", error);
        }
    }

    // Update a conversation's title in the metadata API.
    async function updateConversationTitle(
        id: string,
        title: string
    ) {
        const response = await fetch(
            `/api/conversations/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    project: selectedProject,
                    title,
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update conversation title");
        }

        await refetchConversations();
    }

    // Run the agent in the selected conversation.
    async function runAgent() {
        const userPrompt = prompt.trim();

        if (!userPrompt || loading) return;

        setLoading(true);
        setTerminalOutput([]);

        try {
            let activeConversationId = conversationId;

            // Create a conversation if none is selected.
            if (!activeConversationId) {
                const conversation = (await createConversation({
                    project: selectedProject,
                }).unwrap()) as Conversation;

                activeConversationId = conversation.id;
                setConversationId(activeConversationId);

                await refetchConversations();
            }

            // Set a title from the first prompt.
            const currentConversation = conversations?.find(
                (chat: Conversation) =>
                    chat.id === activeConversationId
            );

            if (
                !currentConversation ||
                currentConversation.title === "New Chat"
            ) {
                try {
                    await updateConversationTitle(
                        activeConversationId,
                        generateConversationTitle(userPrompt)
                    );
                } catch (error) {
                    // A title failure should not prevent the agent running.
                    console.error("Title update error:", error);
                }
            }

            setEvents((previous) => [
                ...previous,
                {
                    type: "message",
                    content: userPrompt,
                } as AgentEvent,
            ]);

            setPrompt("");

            const response = await fetch("/api/agent/stream", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: userPrompt,
                    project: selectedProject,
                    conversationId: activeConversationId,
                }),
            });

            if (!response.ok) {
                throw new Error(
                    `Agent request failed: ${response.status}`
                );
            }

            if (!response.body) {
                throw new Error("Agent response stream is unavailable");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();

                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";

                for (const line of lines) {
                    if (!line.trim()) continue;

                    const agentEvent = JSON.parse(line) as AgentEvent;

                    setEvents((previous) => [
                        ...previous,
                        agentEvent,
                    ]);
                }
            }

            // Process a final line if the stream doesn't end with newline.
            if (buffer.trim()) {
                const agentEvent = JSON.parse(buffer) as AgentEvent;

                setEvents((previous) => [
                    ...previous,
                    agentEvent,
                ]);
            }

            await loadFiles();
            await refetchConversations();
        } catch (error) {
            console.error("Agent error:", error);

            setEvents((previous) => [
                ...previous,
                {
                    type: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Something went wrong",
                } as AgentEvent,
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-[var(--agent-bg)] text-[var(--agent-text)]">
                <div className="mx-auto max-w-7xl py-6 sm:py-8">
                    <AppHeader />

                    <div className="mt-6">
                        <ProjectSelector
                            projects={data?.projects ?? []}
                            selectedProject={selectedProject}
                            newProjectName={newProjectName}
                            onProjectChange={setSelectedProject}
                            onNewProjectChange={setNewProjectName}
                            onCreateProject={() => { }}
                        />
                    </div>

                    <div className="flex w-full py-2">
                        <div className="w-2/5 pr-1">
                            <div>
                                <button
                                    onClick={handleNewChat}
                                    disabled={loading}
                                    className="mb-3 rounded border px-3 py-2 disabled:opacity-50"
                                >
                                    + New Chat
                                </button>

                                <ChatComponent events={events} />

                                <ChatHistory
                                    conversations={conversations || []}
                                    conversationId={conversationId}
                                    setConversationId={handleSelectConversation}
                                />

                                <AgentInput
                                    prompt={prompt}
                                    loading={loading}
                                    onPromptChange={setPrompt}
                                    onRun={runAgent}
                                />
                            </div>
                        </div>

                        {isCode && (
                            <div className="flex w-3/5">
                                <FileExplorer
                                    files={files}
                                    selectedFile={selectedFile}
                                    setSelectedFile={setSelectedFile}
                                />

                                <EditorPanel
                                    selectedFile={selectedFile}
                                    fileContent={openedFile?.content}
                                    saving={saving}
                                    onContentChange={setFileContent}
                                    onSave={() =>
                                        saveFile({
                                            file: selectedFile,
                                            content: fileContent,
                                            project: selectedProject,
                                        })
                                    }
                                />
                            </div>
                        )}

                        {!isCode && (
                            <div className="w-full">
                                {previewUrl && (
                                    <PreviewPanel url={previewUrl} />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                        <TerminalPanel output={terminalOutput} />

                        <ProcessesPanel
                            processes={processes}
                            onStop={async (pid) => {
                                await fetch("/api/process/stop", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ pid }),
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}
