import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiHandle } from "../../utils/apiHandle";
import { typeConstants } from "../../utils/constant";

// ─── GET ALL USERS ──────────────────────────────────────────
export const getUsersAsync = createAsyncThunk(
    typeConstants.GET_ALL_USERS,
    async ({ page = 1, limit = 10, search = '' } = {}, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams({ page, limit });
            if (search && search.trim()) {
                params.append('search', search.trim());
            }
            const response = await apiHandle.get(`api/admin/users?${params.toString()}`);
            return response?.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to fetch users"
            );
        }
    }
);


// ─── CREATE USER ─────────────────────────────────────────────
export const createUserAsync = createAsyncThunk(
    typeConstants.CREATE_USER,
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiHandle.post("api/admin/users", payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to create user"
            );
        }
    }
);

// ─── UPDATE USER ─────────────────────────────────────────────
export const updateUserAsync = createAsyncThunk(
    typeConstants.UPDATE_USER,
    async ({ id, ...body }, { rejectWithValue }) => {
        try {
            const response = await apiHandle.patch(`api/admin/users/${id}/profile`, body);
            return { ...response.data, userId: id };
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to update user"
            );
        }
    }
);

// ─── DELETE USER ─────────────────────────────────────────────
export const deleteUserAsync = createAsyncThunk(
    typeConstants.DELETE_USER,
    async (userId, { rejectWithValue }) => {
        try {
            const response = await apiHandle.delete(`api/admin/users/${userId}`);
            return { ...response.data, userId };
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to delete user"
            );
        }
    }
);
