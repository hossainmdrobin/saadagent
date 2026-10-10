import { baseApi } from "../base-api";
import type { Project } from "@/lib/workspace/project-manager";

export interface ListProjectsResponse {
  projects: Project[];
}

export interface CreateProjectRequest {
  name: string;
}

export interface CreateProjectResponse {
  project: Project;
}

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProjects: builder.query<ListProjectsResponse, void>({
      query: () => "/projects",
      providesTags: (result) =>
        result
          ? [
              ...result.projects.map(({ name }) => ({ type: "Project" as const, name })),
              { type: "Project" as const, id: "LIST" },
            ]
          : [{ type: "Project" as const, id: "LIST" }],
    }),
    createProject: builder.mutation<CreateProjectResponse, CreateProjectRequest>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Project", id: "LIST" }],
    }),
  }),
});

export const { useListProjectsQuery, useCreateProjectMutation } = projectsApi;