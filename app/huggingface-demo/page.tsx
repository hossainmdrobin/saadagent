import { ChatForm } from "@/components/ai/chat-form";
import { getHuggingFaceSettings } from "@/lib/ai/huggingface";

export default function HuggingFaceDemoPage() {
  const { configured, defaultModel } = getHuggingFaceSettings();

  return (
    <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-16 px-8">
      <h1 className="text-2xl font-semibold tracking-tight">Hugging Face Inference API</h1>
      <ChatForm configured={configured} defaultModel={defaultModel} />
    </main>
  );
}