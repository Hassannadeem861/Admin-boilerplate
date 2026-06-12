import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiHandle } from "../../utils/apiHandle";
import { typeConstants } from "../../utils/constant";

// =========>>>>>>> Login <<<<<===========
export const loginAsync = createAsyncThunk(
  typeConstants.LOGIN,
  async (payload, { rejectWithValue }) => {
    console.log("Login payload: ", payload);
    try {
      const response = await apiHandle.post("api/admin/login", payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Login failed"
      );
    }
  }
);

// =========>>>>>>> Logout <<<<<===========
export const logoutAsync = createAsyncThunk(
  typeConstants.LOGOUT_AUTH,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.post("/auth/logout");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Logout failed"
      );
    }
  }
);

// =========>>>>>>> Check Auth <<<<<===========
export const checkAuthAsync = createAsyncThunk(
  typeConstants.CHECK_AUTH,
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiHandle.get("/auth/checkauth");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Auth check failed"
      );
    }
  }
);