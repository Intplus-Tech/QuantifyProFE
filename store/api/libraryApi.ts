import { baseApi } from "./baseApi";
import { library as libraryEndpoints } from "@/utils/endpoints";
import {
  ApiResponse,
  PaginatedResponse,
  LibraryCategory,
  LibraryItem,
  CreateCategoryInput,
  CreateLibraryItemInput,
} from "@/types/api";
import { setCategories, setItems } from "../slices/librarySlice";

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryCategories: builder.query<ApiResponse<LibraryCategory[]>, void>({
      query: () => libraryEndpoints.categories.list,
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
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Documents"],
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
        method: "POST",
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
