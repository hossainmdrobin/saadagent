import { z } from "zod";

export const chatMessageSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a message." })
  .max(2000, { error: "Messages are limited to 2000 characters." });

export const chatModelSchema = z
  .string()
  .trim()
  .regex(/^[\w.-]+\/[\w.-]+(:[a-z0-9-]+)?$/, {
    error: "Use a model id like openai/gpt-oss-120b or meta-llama/Llama-3.1-8B-Instruct:fastest.",
  })
  .max(120, { error: "Model ids are limited to 120 characters." });

export const chatSchema = z.object({
  message: chatMessageSchema,
  model: chatModelSchema.optional(),
});