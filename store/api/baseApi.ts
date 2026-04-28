import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiEndpoints } from "@/utils/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery({
    baseUrl: ApiEndpoints.baseUrl,
  }),
  tagTypes: [
    "User",
    "Auth",
    "Documents",
    "Plans",
    "Billing",
    "PaymentMethods",
    "Company",
    "Templates",
    "Clients",
    "Dashboard",
    "Projects",
    "Library",
  ],
  endpoints: () => ({}),
});
