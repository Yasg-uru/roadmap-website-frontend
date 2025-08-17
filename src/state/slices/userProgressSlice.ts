// state/slices/userProgressSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { IUserProgressResponse } from "../../types/user/progress/UserProgress";

interface UserProgressState {
  progress: IUserProgressResponse | null;
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
  async (roadmapId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/progress/user/start/${roadmapId}`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      console.log("this is an error inside start roadmap :", error);
      return rejectWithValue(
        error.response?.data || "Failed to fetch user progress"
      );
    }
  }
);

// Fetch user progress for a roadmap
export const fetchUserProgress = createAsyncThunk(
  "userProgress/fetchUserProgress",
  async (roadmapId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/progress/user/roadmap/${roadmapId}`,
        { withCredentials: true }
      );
      return response.data as IUserProgressResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user progress"
      );
    }
  }
);
export const updateUserProgress = createAsyncThunk(
  "userProgress/updateUserProgress",
  async (
    {
      roadmapId,
      nodeId,
      status,
    }: { roadmapId: string; nodeId: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/progress/user/roadmap/${roadmapId}/${nodeId}`,
        { status },
        { withCredentials: true }
      );
      return response.data as IUserProgressResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data || "Failed to update user progress"
      );
    }
  }
);

// Upsert user progress (completed nodes)
export const upsertUserProgress = createAsyncThunk<
  IUserProgressResponse,
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
      return response.data as IUserProgressResponse;
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
        (state, action: PayloadAction<IUserProgressResponse>) => {
          state.loading = false;
          state.progress = action.payload;
        }
      )
      // .addCase(fetchUserProgress.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload ?? "Unknown error";
      // })

      .addCase(
        upsertUserProgress.fulfilled,
        (state, action: PayloadAction<IUserProgressResponse>) => {
          state.progress = action.payload;
        }
      );
  },
});

export const { clearProgress } = userProgressSlice.actions;

export default userProgressSlice.reducer;
