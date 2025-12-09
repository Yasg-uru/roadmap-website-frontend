import axiosInstance from "@/helper/axiosInstance";
import type { roadmapState } from "@/types/user/roadmap/roadmapSlice.types";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const initialState: roadmapState = {
  isLoading: false,
  roadmaps: [],
  roadmap: null,
  paginationMeta: null,
};
export const getRoadmaps = createAsyncThunk(
  "roadmap/getroadmaps",
  async (page: number, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/roadmap/", {
        withCredentials: true,
        params: { page },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const getRoadMapDetails = createAsyncThunk(
  "roadmap/getRoadMapDetails",
  async (roadMapId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/roadmap/${roadMapId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error:any) {
        return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
export const generateRoadmap = createAsyncThunk(
  "roadmap/generateroadmap",
  async (payload: { prompt: string; isCommunityContributed?: boolean }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/roadmap/generate",
        {
          userPrompt: payload.prompt,
          isCommunityContributed: payload.isCommunityContributed || false,
        },
        { withCredentials: true }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
)
export const roadmapSlice = createSlice({
  name: "roadmap",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getRoadmaps.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoadmaps.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getRoadmaps.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roadmaps = action.payload?.roadmaps || [];
        state.paginationMeta = action.payload?.paginationMeta || null;
      })
      .addCase(getRoadMapDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRoadMapDetails.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getRoadMapDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roadmap = action.payload || null;
      })
      .addCase(generateRoadmap.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateRoadmap.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(generateRoadmap.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roadmap = action.payload || null;
      })
  },
});
export const {} = roadmapSlice.actions;
export default roadmapSlice.reducer;
