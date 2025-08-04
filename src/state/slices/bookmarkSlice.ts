import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helper/axiosInstance";
import type { Bookmark } from "../../types/Bookmark/bookmark";
import type { PayloadAction } from "@reduxjs/toolkit";

interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
}

const initialState: BookmarkState = {
  bookmarks: [],
  loading: false,
  error: null,
};

export const fetchBookmarks = createAsyncThunk(
  "bookmarks/fetchBookmarks",
  async (userId: string, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/bookmarks/${userId}`);
      return response.data as Bookmark[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "failed to fetch bookmarks"
      );
    }
  }
);

export const upsertBookmark = createAsyncThunk(
  "bookmarks/upsertBookmark",
  async (bookmark: Partial<Bookmark>, thunkAPI) => {
    try {
      const response = await axiosInstance.post("/api/bookmarks", bookmark);
      return response.data as Bookmark;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "failed to upsert bookmark"
      );
    }
  }
);

export const deleteBookmark = createAsyncThunk(
  "bookmark/deleteBookmark",
  async (
    { userId, roadmapId }: { userId: string; roadmapId: string },
    thunkAPI
  ) => {
    try {
      await axiosInstance.delete(`/api/bookmarks/${userId}/${roadmapId}`);
      return roadmapId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to delete bookmark"
      );
    }
  }
);

const bookmarkSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchBookmarks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchBookmarks.fulfilled,
        (state, action: PayloadAction<Bookmark[]>) => {
          state.loading = false;
          state.bookmarks = action.payload;
        }
      )

      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(
        upsertBookmark.fulfilled,
        (state, action: PayloadAction<Bookmark>) => {
          const index = state.bookmarks.findIndex(
            (b) => b.roadmap === action.payload.roadmap
          );
          if (index !== -1) {
            state.bookmarks[index] = action.payload;
          } else {
            state.bookmarks.push(action.payload);
          }
        }
      )

      .addCase(
        deleteBookmark.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.bookmarks = state.bookmarks.filter(
            (b) => b.roadmap !== action.payload
          );
        }
      );
  },
});

export default bookmarkSlice.reducer;
