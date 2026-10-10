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
import { useListProjectsQuery } from "@/store/features/projects-api";
import { useOpenFileQuery, useSaveFileMutation } from "@/store/features/file-api";
import { useCreateConversationMutation, useGetConversationsQuery } from "@/store/features/conversation-api";

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<string[]>([]);
    const [isCode, setIsCode] = useState(false);
    const [messages, setMessages] = useState()
    const [conversationId, setConversationId] = useState(() => crypto.randomUUID());
    //READING FILES STATE
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState("");

    // TERMINAL OUTPUT
    const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

    // PROCESS PRESERVED
    const [processes, setProcesses] = useState<any[]>([]);

    // THE PREVIEW URL
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    // THE PROJECT LIST
    const [selectedProject, setSelectedProject] = useState("demo");
    const [newProjectName, setNewProjectName] = useState("");
    // USE REF
    const selectedFileRef = useRef<string | null>(null);

    // REDUX HOOKS
    const { data } = useListProjectsQuery();
    const { data: openedFile } = useOpenFileQuery({ project: selectedProject, file: selectedFile || "" })
    const [saveFile, { isLoading: saving }] = useSaveFileMutation();
    const { data: conversations } = useGetConversationsQuery({ project: selectedProject })
    console.log("CONVERSATION DATA:", data)
    const [createConversation, { data: createConversationData }] = useCreateConversationMutation()

    useEffect(() => {
        loadFiles();
        setSelectedFile(null)
    }, [selectedProject]);

    // LIVE FILE WATCHER
    useEffect(() => {
        const events = new EventSource(
            `/api/workspace/events?project=${encodeURIComponent(selectedProject)}`
        );

        events.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            console.log("WORKSPACE EVENT:", data);
            if (data.type === "process_output") {
                setTerminalOutput((previous) => [...previous, data.data]);

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
                    data.type === "changed" &&
                    currentFile &&
                    data.path === currentFile
                ) {
                    // await openFile(currentFile);
                }

                if (
                    data.type === "deleted" &&
                    data.path === currentFile
                ) {
                    selectedFileRef.current = null;
                    setSelectedFile(null);
                    setFileContent("");
                }
            }
        };

        return () => {
            events.close();
        };
    }, [selectedFile, selectedProject]);

    async function loadFiles() {
        const response = await fetch(`/api/workspace?project=${selectedProject}`);
        const data = await response.json();
        setFiles(data.files ?? []);
    }


    async function runAgent() {
        setTerminalOutput([]);
        if (!prompt.trim()) return;

        setLoading(true);
        setEvents([]);

        const response = await fetch("/api/agent/stream", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt,
                project: selectedProject,
                conversationId: 'chat-test-1'
            }),
        });

        if (!response.body) {
            setLoading(false);
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, {
                stream: true,
            });

            const lines = buffer.split("\n");

            buffer = lines.pop() ?? "";

            for (const line of lines) {
                if (!line.trim()) continue;

                const event = JSON.parse(line);

                console.log("EVENT:", event);

                setEvents((previous) => [
                    ...previous,
                    event,
                ]);
            }
        }
        await loadFiles()
        setLoading(false);
    }

    return (
        <ThemeProvider>
            <div className="min-h-screen bg-[var(--agent-bg)] text-[var(--agent-text)]">
                <div className="mx-auto max-w-7xl py-6 sm:py-8 ">
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
                            <div className="">
                                <button
                                    onClick={() => {
                                        createConversation({ project: selectedProject })
                                    }}
                                >
                                    New Chat
                                </button>
                                <ChatComponent events={events} />
                                <AgentInput
                                    prompt={prompt}
                                    loading={loading}
                                    onPromptChange={setPrompt}
                                    onRun={runAgent}
                                />
                            </div>
                        </div>

                        {isCode && <div className="flex w-3/5">
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
                                onSave={() => saveFile({ file: selectedFile, content: fileContent, project: selectedProject })}
                            />
                        </div>}
                        {!isCode && <div className="w-full">
                            {previewUrl && <PreviewPanel url={previewUrl} />}
                        </div>}
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
