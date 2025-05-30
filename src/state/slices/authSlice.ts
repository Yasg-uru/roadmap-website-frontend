import type { authState } from "@/types/user/authSlice.types";
import { createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/helper/axiosInstance";

export const registerUser = createAsyncThunk<
  any,
  { username: string; email: string; password: string; profileFile?: File },
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    if (userData.profileFile) {
      formData.append("file", userData.profileFile);
    }

    const { data } = await axiosInstance.post(`user/register`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Verify User
export const verifyUser = createAsyncThunk<
  any,
  { email: string; code: string },
  { rejectValue: string }
>("auth/verifyUser", async (verifyData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`/user/verify-code`, verifyData, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Login User
export const loginUser = createAsyncThunk<
  any,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (loginData, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(`/user/sign-in`, loginData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true, // important for cookies
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error || error.message);
  }
});

// Logout User
export const logoutUser = createAsyncThunk<any, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/user/logout`, {
        withCredentials: true,
      });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Forgot Password
export const forgotPassword = createAsyncThunk<
  any,
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async (emailData, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(`/user/forgot-password`, emailData, {
      headers: { "Content-Type": "application/json" },
    });
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

// Reset Password
export const resetPassword = createAsyncThunk<
  any,
  { token: string; password: string },
  { rejectValue: string }
>("auth/resetPassword", async ({ token, password }, { rejectWithValue }) => {
  try {
    const { data } = await axios.post(
      `/user/reset-password/${token}`,
      { password },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message);
  }
});

const initialState: authState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
      })

      // Verify
      .addCase(verifyUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.isLoading = false;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {})

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export const {} = authSlice.actions;
export const authReducer = authSlice.reducer;
