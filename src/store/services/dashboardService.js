import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiHandle } from "../../utils/apiHandle";
import { typeConstants } from "../../utils/constant";

// ─── GET DASHBOARD DATA ──────────────────────────────────────
export const getDashboardAsync = createAsyncThunk(
    typeConstants.GET_DASHBOARD,
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiHandle.get("api/admin/dashboard");
            console.log("getDashboardAsync: ", response?.data);
            return response?.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to fetch dashboard"
            );
        }
    }
);