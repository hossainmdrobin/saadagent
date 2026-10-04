"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { asApiError, toFieldErrorMap } from "@/lib/api-client";
import { chatMessageSchema, chatModelSchema } from "@/lib/validation/chat";
import { useSendChatMessageMutation } from "@/store/features/chat-api";
import type { ChatResponse } from "@/store/features/chat-api";

export interface ChatFormProps {
  configured: boolean;
  defaultModel: string;
}

export function ChatForm({ configured, defaultModel }: ChatFormProps) {
  const [sendMessage, { isLoading }] = useSendChatMessageMutation();
  const [values, setValues] = useState({ message: "", model: defaultModel });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [reply, setReply] = useState<ChatResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setReply(null);

    const parsedMessage = chatMessageSchema.safeParse(values.message);

    if (!parsedMessage.success) {
      setFieldErrors({ message: parsedMessage.error.issues[0]?.message ?? "Enter a message." });
      return;
    }

    const parsedModel = chatModelSchema.safeParse(values.model);

    if (!parsedModel.success) {
      setFieldErrors({ model: parsedModel.error.issues[0]?.message ?? "Invalid model id." });
      return;
    }

    setFieldErrors({});

    try {
      const response = await sendMessage({
        message: parsedMessage.data,
        model: parsedModel.data,
      }).unwrap();

      setReply(response);
      setValues((current) => ({ ...current, message: "" }));
    } catch (error) {
      const apiError = asApiError(error);
      setFormError(apiError.message);
      setFieldErrors(toFieldErrorMap(apiError.fieldErrors));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hugging Face chat</CardTitle>
        <CardDescription>
          Sends the message to the Hugging Face Inference API through
          <code className="mx-1 font-mono text-xs">POST /api/chat</code>.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!configured ? (
          <Alert variant="info" title="Hugging Face is not configured">
            Add <code className="font-mono text-xs">HUGGINGFACE_API_KEY</code> to
            <code className="ml-1 font-mono text-xs">.env.local</code> before sending a
            message.
          </Alert>
        ) : null}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <Field id="model" label="Model" error={fieldErrors.model}>
            <Input
              id="model"
              name="model"
              type="text"
              spellCheck={false}
              placeholder="meta-llama/Llama-3.1-8B-Instruct"
              value={values.model}
              invalid={Boolean(fieldErrors.model)}
              onChange={(event) =>
                setValues((current) => ({ ...current, model: event.target.value }))
              }
            />
          </Field>

          <Field id="message" label="Message" error={fieldErrors.message}>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Ask the model something..."
              value={values.message}
              aria-invalid={Boolean(fieldErrors.message) || undefined}
              className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-100"
              onChange={(event) =>
                setValues((current) => ({ ...current, message: event.target.value }))
              }
            />
          </Field>

          <Button type="submit" isLoading={isLoading} disabled={isLoading || !configured}>
            {isLoading ? "Sending..." : "Send message"}
          </Button>

          {reply ? (
            <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/60">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {reply.model}
              </p>
              <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-100">
                {reply.reply}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {reply.usage.totalTokens} tokens &middot; finish reason{" "}
                {reply.finishReason ?? "unknown"}
              </p>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}