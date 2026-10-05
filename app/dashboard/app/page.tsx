"use client";

import { useEffect, useState } from "react";
import ChatComponent from "./ChatComponent";
import { AgentEvent } from "./types";


export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [loading, setLoading] = useState(false);

    const [files, setFiles] = useState<string[]>([])

    useEffect(() => {
        loadFiles();
    }, []);

    async function loadFiles() {
        const response = await fetch("/api/workspace");

        const data = await response.json();

        setFiles(data.files ?? []);
    }

    async function runAgent() {
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

        setLoading(false);
    }

    return (
        <main className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                SaadAgent
            </h1>
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
                            <div
                                key={file}
                                className="text-sm"
                            >
                                📄 {file}
                            </div>
                        ))}
                    </div>
                )}
            </div>

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

            <div className="mt-8 space-y-2 text-red-400">
                <ChatComponent events={events} />
            </div>
        </main>
    );
}
