import { baseApi } from "./baseApi";
import { ApiMethods } from "@/utils/apiMethods";
import { library as libraryEndpoints } from "@/utils/endpoints";
import { ApiResponse, PaginatedResponse } from "@/types/common";
import {
  LibraryCategory,
  LibraryCategorySummary,
  LibraryItem,
  LibraryItemPriceHistoryData,
  LibraryUnit,
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateLibraryItemInput,
  UpdateLibraryItemInput,
  GetPriceHistoryParams,
} from "@/types/library";
import { setCategories, setItems, addCategory } from "../slices/librarySlice";

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Categories ───────────────────────────────────────────────────────────

    getLibraryCategories: builder.query<
      ApiResponse<LibraryCategory[]>,
      { companyId?: string; search?: string; activeOnly?: boolean } | void
    >({
      query: (params) => ({
        url: libraryEndpoints.categories.list,
        method: ApiMethods.GET,
        ...(params ? { params } : {}),
      }),
      providesTags: ["Library"],
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
      invalidatesTags: ["Library"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data) dispatch(addCategory(data.data));
        } catch {}
      },
    }),

    updateLibraryCategory: builder.mutation<
      ApiResponse<LibraryCategory>,
      { categoryId: string; body: UpdateCategoryInput }
    >({
      query: ({ categoryId, body }) => ({
        url: libraryEndpoints.categories.update(categoryId),
        method: ApiMethods.PATCH,
        body,
      }),
      invalidatesTags: ["Library"],
    }),

    deleteLibraryCategory: builder.mutation<ApiResponse<null>, string>({
      query: (categoryId) => ({
        url: libraryEndpoints.categories.delete(categoryId),
        method: ApiMethods.DELETE,
      }),
      invalidatesTags: ["Library"],
    }),

    getLibraryCategoriesSummary: builder.query<
      ApiResponse<LibraryCategorySummary[]>,
      { companyId?: string } | void
    >({
      query: (params) => ({
        url: libraryEndpoints.categories.summary,
        method: ApiMethods.GET,
        ...(params ? { params } : {}),
      }),
      providesTags: ["Library"],
    }),

    // ─── Library Items ────────────────────────────────────────────────────────

    getLibraryItems: builder.query<
      PaginatedResponse<LibraryItem>,
      {
        page?: number;
        limit?: number;
        categoryId?: string;
        companyId?: string;
        search?: string;
        state?: string;
        country?: string;
      } | void
    >({
      query: (params) => ({
        url: libraryEndpoints.items.list,
        method: ApiMethods.GET,
        ...(params ? { params } : {}),
      }),
      providesTags: ["Library"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) dispatch(setItems(data));
        } catch {}
      },
    }),

    getLibraryItemById: builder.query<ApiResponse<LibraryItem>, string>({
      query: (itemId) => ({
        url: libraryEndpoints.items.details(itemId),
        method: ApiMethods.GET,
      }),
      providesTags: (result, error, id) => [{ type: "Library", id }],
    }),

    createLibraryItem: builder.mutation<
      ApiResponse<LibraryItem>,
      CreateLibraryItemInput
    >({
      query: (body) => ({
        url: libraryEndpoints.items.create,
        method: ApiMethods.POST,
        body,
      }),
      invalidatesTags: ["Library"],
    }),

    updateLibraryItem: builder.mutation<
      ApiResponse<LibraryItem>,
      { itemId: string; body: UpdateLibraryItemInput }
    >({
      query: ({ itemId, body }) => ({
        url: libraryEndpoints.items.update(itemId),
        method: ApiMethods.PATCH,
        body,
      }),
      invalidatesTags: (result, error, { itemId }) => [
        { type: "Library", id: itemId },
        "Library",
      ],
    }),

    deleteLibraryItem: builder.mutation<ApiResponse<null>, string>({
      query: (itemId) => ({
        url: libraryEndpoints.items.delete(itemId),
        method: ApiMethods.DELETE,
      }),
      invalidatesTags: ["Library"],
    }),

    // ─── Price History ────────────────────────────────────────────────────────

    getLibraryItemPriceHistory: builder.query<
      ApiResponse<LibraryItemPriceHistoryData>,
      GetPriceHistoryParams
    >({
      query: ({ itemId, ...params }) => ({
        url: libraryEndpoints.items.priceHistory(itemId),
        method: ApiMethods.GET,
        params,
      }),
      providesTags: (result, error, { itemId }) => [
        { type: "Library", id: `${itemId}-history` },
      ],
    }),

    // ─── Locations & Units ────────────────────────────────────────────────────

    getLibraryLocations: builder.query<ApiResponse<string[]>, void>({
      query: () => ({
        url: libraryEndpoints.items.locations,
        method: ApiMethods.GET,
      }),
      providesTags: ["Library"],
    }),

    getLibraryUnits: builder.query<ApiResponse<LibraryUnit[]>, void>({
      query: () => ({
        url: libraryEndpoints.items.units,
        method: ApiMethods.GET,
      }),
      providesTags: ["Library"],
    }),
  }),
});

export const {
  // Categories
  useGetLibraryCategoriesQuery,
  useCreateLibraryCategoryMutation,
  useUpdateLibraryCategoryMutation,
  useDeleteLibraryCategoryMutation,
  useGetLibraryCategoriesSummaryQuery,
  // Items
  useGetLibraryItemsQuery,
  useGetLibraryItemByIdQuery,
  useCreateLibraryItemMutation,
  useUpdateLibraryItemMutation,
  useDeleteLibraryItemMutation,
  // Price History
  useGetLibraryItemPriceHistoryQuery,
  useLazyGetLibraryItemPriceHistoryQuery,
  // Locations & Units
  useGetLibraryLocationsQuery,
  useGetLibraryUnitsQuery,
} = libraryApi;
