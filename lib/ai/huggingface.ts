import "server-only";

import { InferenceClient } from "@huggingface/inference";
import {
  InferenceClientProviderApiError,
  InferenceClientRoutingError,
} from "@huggingface/inference";
import { ApiError } from "@/lib/api-response";

const DEFAULT_MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export type HuggingFaceChatRole = "system" | "user" | "assistant";

export interface HuggingFaceChatMessage {
  role: HuggingFaceChatRole;
  content: string;
}

export interface HuggingFaceChatResult {
  model: string;
  content: string;
  finishReason: string | null;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface HuggingFaceSettings {
  configured: boolean;
  defaultModel: string;
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

function getClient(): InferenceClient {
  const accessToken = process.env.HUGGINGFACE_API_KEY?.trim();

  if (!accessToken) {
    throw new ApiError(
      503,
      "AI_NOT_CONFIGURED",
      "Set HUGGINGFACE_API_KEY to call the Hugging Face Inference API.",
    );
  }

  return new InferenceClient(accessToken);
}

function toApiError(error: unknown): ApiError {
  if (error instanceof InferenceClientRoutingError) {
    return new ApiError(
      502,
      "AI_MODEL_UNAVAILABLE",
      "Hugging Face has no provider for that model. Try a different model id.",
    );
  }

  if (error instanceof InferenceClientProviderApiError) {
    const status = error.httpResponse.status;

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

    if (status === 429) {
      return new ApiError(429, "AI_RATE_LIMITED", "Hugging Face is rate limiting this key.", {
        headers: { "Retry-After": "10" },
      });
    }

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

export async function runHuggingFaceChat(input: {
  messages: HuggingFaceChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<HuggingFaceChatResult> {
  const model = input.model || getDefaultHuggingFaceModel();
  const client = getClient();

  let output: Awaited<ReturnType<InferenceClient["chatCompletion"]>>;

  try {
    output = await client.chatCompletion({
      model,
      messages: input.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      max_tokens: input.maxTokens ?? 512,
      temperature: input.temperature ?? 0.7,
    });
  } catch (error) {
    throw toApiError(error);
  }

  const choice = output.choices[0];
  const content = choice?.message.content?.trim();

  if (!content) {
    throw new ApiError(
      502,
      "AI_EMPTY_RESPONSE",
      "The model returned an empty response. Try rephrasing your message.",
    );
  }

  return {
    model: output.model || model,
    content,
    finishReason: choice?.finish_reason ?? null,
    usage: {
      promptTokens: output.usage?.prompt_tokens ?? 0,
      completionTokens: output.usage?.completion_tokens ?? 0,
      totalTokens: output.usage?.total_tokens ?? 0,
    },
  };
}