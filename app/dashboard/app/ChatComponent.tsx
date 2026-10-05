import { AgentEvent } from "./types";

export default function ChatComponent({ events }: { events: AgentEvent[] }) {
    return (
        <div className="mt-8 space-y-3">
            {events.map((event, index) => {
                if (event.type === "thinking") {
                    return (
                        <div key={index} className="text-gray-500">
                            🤔 Thinking...
                        </div>
                    );
                }

                if (event.type === "tool_call") {
                    return (
                        <div
                            key={index}
                            className="border rounded p-3"
                        >
                            🔧 <strong>{event.tool}</strong>

                            <pre className="mt-2 text-sm text-gray-600 overflow-x-auto">
                                {JSON.stringify(event.args, null, 2)}
                            </pre>
                        </div>
                    );
                }

                if (event.type === "tool_result") {
                    return (
                        <div
                            key={index}
                            className="border rounded p-3"
                        >
                            ✅ <strong>{event.tool}</strong>

                            <pre className="mt-2 text-sm text-gray-600 overflow-x-auto">
                                {typeof event.result === "string"
                                    ? event.result
                                    : JSON.stringify(event.result, null, 2)}
                            </pre>
                        </div>
                    );
                }

                if (event.type === "message") {
                    return (
                        <div
                            key={index}
                            className="bg-gray-100 rounded p-3"
                        >
                            {event.content}
                        </div>
                    );
                }

                if (event.type === "done") {
                    return (
                        <div key={index} className="text-green-600">
                            ✓ Done
                        </div>
                    );
                }

                if (event.type === "error") {
                    return (
                        <div
                            key={index}
                            className="border border-red-300 bg-red-50 rounded p-3 text-red-700"
                        >
                            ❌ {event.message}
                        </div>
                    );
                }

                return null;
            })}
        </div>
    )
}