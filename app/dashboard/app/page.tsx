"use client";

import { useEffect, useRef, useState } from "react";
import ChatComponent from "./ChatComponent";
import { AgentEvent } from "./types";


export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<string[]>([])

    //READING FILES STATE
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState("");

    // EDITING FILE STATE
    const [saving, setSaving] = useState(false);

    // TERMINAL OUTPUT
    const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

    // PROCESS PRESERVED
    const [processes, setProcesses] = useState<any[]>([]);

    // USE REF
    const selectedFileRef = useRef<string | null>(null);

    useEffect(() => {
        loadFiles();
    }, []);

    // LIVE FILE WATCHER
    useEffect(() => {
        const events = new EventSource(
            "/api/workspace/events"
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
                    await openFile(currentFile);
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
    }, [selectedFile]);

    async function loadFiles() {
        const response = await fetch("/api/workspace");
        const data = await response.json();
        setFiles(data.files ?? []);
    }

    async function openFile(file: string) {
        setSelectedFile(file);
        selectedFileRef.current = file;

        const response = await fetch(
            `/api/workspace/file?file=${encodeURIComponent(file)}`
        );

        const data = await response.json();

        setFileContent(data.content);
    }

    // EDITING FILE FUNCTION
    async function saveFile() {
        if (!selectedFile) return;

        setSaving(true);

        try {
            const response = await fetch("/api/workspace/file", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    file: selectedFile,
                    content: fileContent,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ?? "Failed to save file");
            }
        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to save file"
            );
        } finally {
            setSaving(false);
        }
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
        <main className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                SaadAgent
            </h1>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask the coding agent..."
                className="w-full border rounded p-3 min-h-32"
            />

            <button
                onClick={runAgent}
                disabled={loading}
                className="mt-3 border rounded px-4 py-2"
            >
                {loading ? "Running..." : "Run Agent"}
            </button>
            <div className="border rounded p-4">
                <h2 className="font-semibold mb-3">
                    WORKSPACE
                </h2>

                {files.length === 0 ? (
                    <p className="text-gray-500">
                        No files
                    </p>
                ) : (
                    <div className="space-y-1">
                        {files.map((file) => (
                            <button
                                key={file}
                                onClick={() => openFile(file)}
                                className="block w-full text-left text-sm hover:bg-gray-100 p-1 rounded"
                            >
                                📄 {file}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {selectedFile && (
                <div className="mt-6 border rounded">
                    <div className="border-b p-3 font-semibold">
                        {selectedFile}
                    </div>

                    <textarea
                        value={fileContent}
                        onChange={(e) => setFileContent(e.target.value)}
                        className="w-full min-h-96 p-4 font-mono text-sm outline-none resize-y"
                    />
                    <div className="border-b p-3 flex items-center justify-between">
                        <span className="font-semibold">
                            {selectedFile}
                        </span>

                        <button
                            onClick={saveFile}
                            disabled={saving}
                            className="border rounded px-3 py-1"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            )}

            <div className="mt-8 space-y-2 text-red-400">
                <ChatComponent events={events} />
                <div className="flex">
                    <div className="rounded-lg bg-black p-4">
                        <div className="mb-3 text-sm text-gray-400">
                            Terminal
                        </div>

                        <pre className="min-h-[200px] whitespace-pre-wrap text-sm text-white">
                            {terminalOutput.length > 0
                                ? terminalOutput.join("")
                                : "No output yet..."}
                        </pre>
                    </div>
                    {/* Running Process */}
                    <div className="rounded-lg border p-4">
                        <div className="mb-3 font-semibold">
                            Running Processes
                        </div>

                        {processes.length === 0 ? (
                            <div className="text-sm text-gray-500">
                                No running processes
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {processes.map((process) => (
                                    <div
                                        key={process.pid}
                                        className="flex items-center justify-between rounded bg-gray-100 p-3"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {process.command}
                                            </div>

                                            <div className="text-xs text-gray-500">
                                                PID: {process.pid} ·{" "}
                                                {process.cwd ?? "workspace"}
                                            </div>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                await fetch("/api/process/stop", {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    body: JSON.stringify({
                                                        pid: process.pid,
                                                    }),
                                                });
                                            }}
                                            className="rounded bg-red-600 px-3 py-1 text-sm text-white"
                                        >
                                            Stop
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}
