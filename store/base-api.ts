import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  prepareHeaders(headers) {
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: apiBaseQuery,
  tagTypes: ["Agent"],
  endpoints: () => ({}),
});

export type AppBaseQuery = typeof apiBaseQuery;
