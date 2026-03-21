import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getSession } from "next-auth/react";
import { ApiEndpoints } from "@/utils/endpoints";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: ApiEndpoints.baseUrl,
    prepareHeaders: async (headers: any) => {
      const session = await getSession();
      const token = (session as any)?.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Auth", "Documents", "Plans"],
  endpoints: () => ({}),
});
