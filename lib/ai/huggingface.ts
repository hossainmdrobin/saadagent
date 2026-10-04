import "server-only";

import { ChatOpenAI } from "@langchain/openai";
import { createDeepAgent } from "deepagents";
import type { BaseMessage } from "@langchain/core/messages";
import { ApiError } from "@/lib/api-response";

const DEFAULT_BASE_URL = "https://router.huggingface.co/v1";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT =
  "You are SaadAgent, a helpful assistant. Answer the user's question directly. " +
  "Only use your tools when they genuinely help with the request.";

export interface HuggingFaceSettings {
  configured: boolean;
  defaultModel: string;
}

export interface DeepAgentChatResult {
  model: string;
  content: string;
  steps: number;
}

export function getHuggingFaceSettings(): HuggingFaceSettings {
  return {
    configured: isHuggingFaceConfigured(),
    defaultModel: getDefaultHuggingFaceModel(),
  };
}

export function isHuggingFaceConfigured(): boolean {
  return Boolean(process.env.HUGGINGFACE_API_KEY?.trim());
}

export function getDefaultHuggingFaceModel(): string {
  return process.env.HUGGINGFACE_MODEL?.trim() || DEFAULT_MODEL;
}

function getAccessToken(): string {
  const accessToken = process.env.HUGGINGFACE_API_KEY?.trim();

  if (!accessToken) {
    throw new ApiError(
      503,
      "AI_NOT_CONFIGURED",
      "Set HUGGINGFACE_API_KEY to call the Hugging Face Inference API.",
    );
  }

  return accessToken;
}

export function createHuggingFaceModel(model?: string): ChatOpenAI {
  return new ChatOpenAI({
    model: model || getDefaultHuggingFaceModel(),
    apiKey: getAccessToken(),
    temperature: 0.7,
    maxTokens: 1024,
    configuration: {
      baseURL: process.env.HUGGINGFACE_BASE_URL?.trim() || DEFAULT_BASE_URL,
    },
  });
}

function getErrorStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const candidate = error as { status?: unknown; statusCode?: unknown };

  if (typeof candidate.status === "number") {
    return candidate.status;
  }

  return typeof candidate.statusCode === "number" ? candidate.statusCode : null;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const status = getErrorStatus(error);

  if (status === 401 || status === 403) {
    return new ApiError(
      502,
      "AI_AUTH_FAILED",
      "Hugging Face rejected the API key. Check HUGGINGFACE_API_KEY.",
    );
  }

  if (status === 402) {
    return new ApiError(
      502,
      "AI_NO_CREDITS",
      "The Hugging Face account has no inference credits left.",
    );
  }

  if (status === 404) {
    return new ApiError(
      502,
      "AI_MODEL_UNAVAILABLE",
      "Hugging Face has no provider for that model. Try a different model id.",
    );
  }

  if (status === 429) {
    return new ApiError(
      429,
      "AI_RATE_LIMITED",
      "Hugging Face is rate limiting this key. Please try again shortly.",
      { headers: { "Retry-After": "10" } },
    );
  }

  if (status !== null) {
    return new ApiError(
      502,
      "AI_UPSTREAM_ERROR",
      `Hugging Face returned an error (${status}). Please try again.`,
    );
  }

  return new ApiError(
    502,
    "AI_REQUEST_FAILED",
    "The model could not be reached. Please try again.",
  );
}

function readMessageContent(message: BaseMessage): string {
  const content = message.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : ("text" in part ? part.text : "")))
      .join("")
      .trim();
  }

  return "";
}

export async function runDeepAgentChat(input: {
  message: string;
  model?: string;
  maxSteps?: number;
}): Promise<DeepAgentChatResult> {
  const model = input.model || getDefaultHuggingFaceModel();

  const agent = createDeepAgent({
    model: createHuggingFaceModel(model),
    systemPrompt: SYSTEM_PROMPT,
  });

  let state: { messages?: BaseMessage[] };

  try {
    state = await agent.invoke(
      { messages: [{ role: "user", content: input.message }] },
      { recursionLimit: (input.maxSteps ?? 8) + 1 },
    );
  } catch (error) {
    throw toApiError(error);
  }

  const messages = state.messages ?? [];
  const reply = [...messages].reverse().find((message) => readMessageContent(message));

  if (!reply) {
    throw new ApiError(
      502,
      "AI_EMPTY_RESPONSE",
      "The agent returned an empty response. Try rephrasing your message.",
    );
  }

  return {
    model,
    content: readMessageContent(reply),
    steps: messages.filter((message) => message.getType() === "ai").length,
  };
}