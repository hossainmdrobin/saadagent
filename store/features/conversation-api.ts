import { baseApi } from "../base-api";

type Conversation = {
    id: string;
    project: string;
    title: string;
    createdAt: string;
    updatedAt: string;
};

export const conversationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query<Conversation[], { project: string }>({
            query: ({ project }) => `/conversations?project=${encodeURIComponent(project)}`,
            transformResponse: (response: { projects: Conversation[] }) => response.projects,
            providesTags: ["CONVERSATIONS"]
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

export const { useGetConversationsQuery, useCreateConversationMutation } = conversationApi;