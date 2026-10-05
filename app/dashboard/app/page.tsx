"use client";

import { useState } from "react";
import ChatComponent from "./ChatComponent";

export type AgentEvent =
    | { type: "thinking" }
    | { type: "tool_call"; tool: string; args: unknown }
    | { type: "tool_result"; tool: string; result: unknown }
    | { type: "message"; content: string }
    | { type: "done" }
    | {type:"error", message:string}

export default function Home() {
    const [prompt, setPrompt] = useState("");
    const [events, setEvents] = useState<AgentEvent[]>([]);
    const [loading, setLoading] = useState(false);

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
