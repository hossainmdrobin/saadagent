import {
  enforceRateLimits,
  handleRouteError,
  jsonError,
  jsonSuccess,
  readJsonBody,
} from "@/lib/api-response";
import { runDeepAgentChat } from "@/lib/ai/huggingface";
import { chatSchema } from "@/lib/validation/chat";
import { MINUTE } from "@/lib/constants";
import type { ChatResponse } from "@/store/features/chat-api";

export async function POST(request: Request) {
  try {
    const input = chatSchema.parse(await readJsonBody(request));

    const rateLimitError = enforceRateLimits(request, {
      scope: "chat",
      limit: 20,
      windowMs: 5 * MINUTE,
    });

    if (rateLimitError) {
      return jsonError(rateLimitError);
    }

    const result = await runDeepAgentChat({
      message: input.message,
      model: input.model,
    });

    const response: ChatResponse = {
      reply: result.content,
      model: result.model,
      steps: result.steps,
    };

    return jsonSuccess(response);
  } catch (error) {
    return handleRouteError(error);
  }
}