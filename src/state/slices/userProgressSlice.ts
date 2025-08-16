// state/slices/userProgressSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { UserProgress } from "../../types/user/progress/UserProgress";

interface UserProgressState {
  progress: UserProgress | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserProgressState = {
  progress: null,
  loading: false,
  error: null,
};
export const startRoadmap = createAsyncThunk(
  "userProgress/startRoadmap",
  async (roadmapId, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/progress/user/start/${roadmapId}`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user progress"
      );
    }
  }
);

// Fetch user progress for a roadmap
export const fetchUserProgress = createAsyncThunk<
  UserProgress,
  { userId: string; roadmapId: string },
  { rejectValue: string }
>("userProgress/fetchUserProgress", async ({ userId, roadmapId }, thunkAPI) => {
  try {
    const response = await axios.get(
      `/api/progress/user/${userId}/roadmap/${roadmapId}`
    );
    return response.data as UserProgress;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(
      error.response?.data || "Failed to fetch user progress"
    );
  }
});

// Upsert user progress (completed nodes)
export const upsertUserProgress = createAsyncThunk<
  UserProgress,
  { userId: string; roadmapId: string; completedNodes: string[] },
  { rejectValue: string }
>(
  "userProgress/upsertUserProgress",
  async ({ userId, roadmapId, completedNodes }, thunkAPI) => {
    try {
      const response = await axios.put(
        `/api/progress/user/${userId}/roadmap/${roadmapId}`,
        {
          completedNodes,
        }
      );
      return response.data as UserProgress;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to upsert user progress"
      );
    }
  }
);

const userProgressSlice = createSlice({
  name: "userProgress",
  initialState,
  reducers: {
    clearProgress(state) {
      state.progress = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProgress.fulfilled,
        (state, action: PayloadAction<UserProgress>) => {
          state.loading = false;
          state.progress = action.payload;
        }
      )
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unknown error";
      })

      .addCase(
        upsertUserProgress.fulfilled,
        (state, action: PayloadAction<UserProgress>) => {
          state.progress = action.payload;
        }
      );
  },
});

export const { clearProgress } = userProgressSlice.actions;

export default userProgressSlice.reducer;
