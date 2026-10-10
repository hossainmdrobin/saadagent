import { baseApi } from "../base-api";

export type Conversation = {
    id: string;
    project: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

interface GetConversationsArg {
    project: string;
}

interface SingleConversationArgs {
    id: string,
    project: string
}

export const conversationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<Conversation[], GetConversationsArg>({
            query: ({ project }) => `/conversations?project=${encodeURIComponent(project)}`,
            providesTags: ["CONVERSATIONS"]
        }),
        getConversationsById: builder.query<Conversation[], SingleConversationArgs>({
            query: ({ project, id }) => `/conversations/${id}?project=${encodeURIComponent(project)}`,
            // providesTags: ["CONVERSATIONS"]
        }),
        createConversation: builder.mutation({
            query: (body) => ({
                url: "/conversations",
                method: "POST",
                body,
            }),
            invalidatesTags: ["CONVERSATIONS"],
        }),

    }),
});

export const { useGetConversationsQuery, useCreateConversationMutation, useGetConversationsByIdQuery } = conversationApi;