
import { baseApi } from "../base-api";

export type Conversation = {
    id: string;
    project: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export type ConversationMessage = {
    type: string;
    content: string;
};

export type ConversationDetails = {
    conversationId: string;
    messages: ConversationMessage[];
};

interface GetConversationsArg {
    project: string;
}

interface SingleConversationArgs {
    id: string;
    project: string;
}

interface CreateConversationArgs {
    project: string;
}

export const conversationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all conversations for a project
        getConversations: builder.query<
            Conversation[],
            GetConversationsArg
        >({
            query: ({ project }) =>
                `/conversations?project=${encodeURIComponent(project)}`,
            providesTags: ["CONVERSATIONS"],
        }),

        // Get one conversation's saved messages
        getConversationsById: builder.query<
            ConversationDetails,
            SingleConversationArgs
        >({
            query: ({ project, id }) =>
                `/conversations/${encodeURIComponent(id)}?project=${encodeURIComponent(project)}`,
        }),

        // Create a new conversation
        createConversation: builder.mutation<
            Conversation,
            CreateConversationArgs
        >({
            query: (body) => ({
                url: "/conversations",
                method: "POST",
                body,
            }),
            invalidatesTags: ["CONVERSATIONS"],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useGetConversationsByIdQuery,
    useCreateConversationMutation,
} = conversationApi;
