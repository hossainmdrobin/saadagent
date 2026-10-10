import { baseApi } from "../base-api";


export const fileApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        openFile: builder.query({
            query: ({project,file}) => `/workspace/file?project=${project}&file=${encodeURIComponent(file)}`,
            providesTags: ["FILE"]
        }),
        saveFile: builder.mutation({
            query: (body) => ({
                url: "/workspace/file",
                method: "POST",
                body,
            }),
            invalidatesTags: ["FILE"],
        }),
    }),
});

export const { useOpenFileQuery, useSaveFileMutation } = fileApi;