import { baseApi } from "@/store/base-api";

export interface SendChatMessageRequest {
  message: string;
  model?: string;
}

export interface ChatResponse {
  reply: string;
  model: string;
  steps: number;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendChatMessage: build.mutation<ChatResponse, SendChatMessageRequest>({
      query: (body) => ({ url: "/chat", method: "POST", body }),
    }),
  }),
});

export const { useSendChatMessageMutation } = chatApi;