import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import axios from "axios";
import type { AxiosRequestConfig, AxiosError, AxiosProgressEvent } from "axios";
import { getToken } from "@/utils/tokenManager";

export interface ApiError {
  status: number | "NETWORK_ERROR";
  data: unknown;
  /** request that failed, so a validation error can be traced to its endpoint */
  url?: string;
  method?: string;
}

export interface RequestArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  body?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
  onUploadProgress?: (event: AxiosProgressEvent) => void;
}

type AxiosBaseQuery = BaseQueryFn<string | RequestArgs, unknown, ApiError>;

export const axiosBaseQuery = (
  { baseUrl }: { baseUrl: string } = { baseUrl: "" }
): AxiosBaseQuery =>
  async (args, api) => {
    const { url, method = "GET", body, params, headers, onUploadProgress } =
      typeof args === "string" ? ({ url: args } as RequestArgs) : args;

    const token = getToken();

    try {
      const { data } = await axios({
        url: `${baseUrl}${url}`,
        method,
        data: body,
        params,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          ...headers,
        },
        onUploadProgress,
        signal: api.signal,
      });

      return { data };
    } catch (error) {
      if (axios.isCancel(error)) throw error;

      const { response, message } = error as AxiosError;
      const fullUrl = `${baseUrl}${url}`;

      if (process.env.NODE_ENV !== "production") {
        console.error(
          `[api] ${method} ${fullUrl} → ${response?.status ?? "NETWORK_ERROR"}`,
          response?.data ?? message,
        );
      }

      return {
        error: {
          status: response?.status ?? "NETWORK_ERROR",
          data: response?.data ?? message,
          url: fullUrl,
          method: String(method),
        },
      };
    }
  };
