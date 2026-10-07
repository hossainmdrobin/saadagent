"use client";

import { useCallback, type FormEvent } from "react";

import type { AgentEvent } from "./types";

export function useAgentCallbacks(
  state: ReturnType<typeof import("./use-home-state").useHomeState>,
) {
  const { prompt, running, setRunning, setTab, pushEntry, loadFiles } = state;

  const handleAgentEvent = useCallback(
    (event: AgentEvent) => {
      if (event.type === "message") {
        pushEntry("message", event.content);
      } else if (event.type === "tool_call") {
        pushEntry("tool", JSON.stringify(event.args, null, 2), event.tool);
      } else if (event.type === "tool_result") {
        pushEntry(
          "tool",
          typeof event.result === "string"
            ? event.result
            : JSON.stringify(event.result, null, 2),
          event.tool,
        );
      } else if (event.type === "error") {
        pushEntry("error", event.message);
      }
    },
    [pushEntry],
  );

  const runAgent = useCallback(
    async (event?: FormEvent) => {
      event?.preventDefault();

      if (!prompt.trim() || running) return;

      setRunning(true);
      setTab("console");
      pushEntry("system", `Agent run started: ${prompt.trim()}`);

      try {
        const response = await fetch("/api/agent/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });

        if (!response.body) return;

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

            let agentEvent: AgentEvent;

            try {
              agentEvent = JSON.parse(line) as AgentEvent;
            } catch {
              continue;
            }

            handleAgentEvent(agentEvent);
          }
        }

        pushEntry("system", "Agent run completed");
      } catch (error) {
        pushEntry(
          "error",
          error instanceof Error ? error.message : "Agent request failed",
        );
      } finally {
        await loadFiles();
        setRunning(false);
      }
    },
    [prompt, running, handleAgentEvent, loadFiles, pushEntry, setRunning, setTab],
  );

  return { handleAgentEvent, runAgent };
}
