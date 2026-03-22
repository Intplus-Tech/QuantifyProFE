import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LibraryCategory, LibraryItem, PaginatedResponse } from "@/types/api";

interface LibraryState {
  categories: LibraryCategory[];
  items: LibraryItem[];
  totalItems: number;
}

const initialState: LibraryState = {
  categories: [],
  items: [],
  totalItems: 0,
};

const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<LibraryCategory[]>) => {
      state.categories = action.payload;
    },
    addCategory: (state, action: PayloadAction<LibraryCategory>) => {
      state.categories.unshift(action.payload);
    },
    setItems: (
      state,
      action: PayloadAction<PaginatedResponse<LibraryItem>>,
    ) => {
      state.items = action.payload.data;
      state.totalItems = action.payload.pagination.total;
    },
  },
});

export const { setCategories, setItems, addCategory } = librarySlice.actions;
export default librarySlice.reducer;
