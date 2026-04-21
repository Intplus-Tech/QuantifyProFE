import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiEndpoints } from "@/utils/endpoints";
import { getToken } from "@/utils/tokenManager";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: ApiEndpoints.baseUrl,
    prepareHeaders: (headers) => {
      const token = getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
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
  ],
  endpoints: () => ({}),
});
