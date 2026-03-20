import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { library as libraryEndpoints } from "@/utils/endpoints";
import {
  ApiResponse,
  PaginatedResponse,
  LibraryCategory,
  LibraryItem,
  CreateCategoryInput,
  CreateLibraryItemInput,
} from "@/types/api";
import { setCategories, setItems, addCategory } from "../slices/librarySlice";

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryCategories: builder.query<ApiResponse<LibraryCategory[]>, { companyId?: string, search?: string, activeOnly?: boolean } | void>({
      query: (params) => ({
        url: libraryEndpoints.categories.list,
        method: ApiMethods.GET,
        ...(params ? { params } : {}),
      }),
      providesTags: ["Documents"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setCategories(data.data));
        } catch {}
      },
    }),
    createLibraryCategory: builder.mutation<
      ApiResponse<LibraryCategory>,
      CreateCategoryInput
    >({
      query: (data) => ({
        url: libraryEndpoints.categories.create,
        method: ApiMethods.POST,
        body: data,
      }),
      invalidatesTags: ["Documents"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) {
            dispatch(addCategory(data.data));
          }
        } catch {}
      },
    }),
    getLibraryItems: builder.query<PaginatedResponse<LibraryItem>, any>({
      query: (params) => ({
        url: libraryEndpoints.items.list,
        params,
      }),
      providesTags: ["Documents"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setItems(data));
        } catch {}
      },
    }),
    createLibraryItem: builder.mutation<
      ApiResponse<LibraryItem>,
      CreateLibraryItemInput
    >({
      query: (data) => ({
        url: libraryEndpoints.items.create,
        method: ApiMethods.POST,
        body: data,
      }),
      invalidatesTags: ["Documents"],
    }),
  }),
});

export const {
  useGetLibraryCategoriesQuery,
  useCreateLibraryCategoryMutation,
  useGetLibraryItemsQuery,
  useCreateLibraryItemMutation,
} = libraryApi;
