import { createSlice } from "@reduxjs/toolkit";
import { asyncStatus } from "../../utils/asyncStatus";
import {
    getUsersAsync,
    createUserAsync,
    updateUserAsync,
    deleteUserAsync,
} from "../services/userService";

const initialState = {
    users: [],
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    },
    get_status: asyncStatus.IDLE,
    get_error: null,
    create_status: asyncStatus.IDLE,
    create_error: null,
    update_status: asyncStatus.IDLE,
    update_error: null,
    delete_status: asyncStatus.IDLE,
    delete_error: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,

    reducers: {
        resetCreateStatus: (state) => {
            state.create_status = asyncStatus.IDLE;
            state.create_error = null;
        },
        resetUpdateStatus: (state) => {
            state.update_status = asyncStatus.IDLE;
            state.update_error = null;
        },
        resetDeleteStatus: (state) => {
            state.delete_status = asyncStatus.IDLE;
            state.delete_error = null;
        },
    },

    extraReducers: (builder) => {
        // ─── GET ALL USERS ─────────────────────────────────────────
        builder
            .addCase(getUsersAsync.pending, (state) => {
                state.get_status = asyncStatus.LOADING;
                state.get_error = null;
            })
            .addCase(getUsersAsync.fulfilled, (state, { payload }) => {
                state.get_status = asyncStatus.SUCCEEDED;
                state.users = payload?.users || [];
                if (payload?.pagination) {
                    state.pagination = payload.pagination;
                }
            })
            .addCase(getUsersAsync.rejected, (state, { payload }) => {
                state.get_status = asyncStatus.ERROR;
                state.get_error = payload;
            });

        // ─── CREATE USER ──────────────────────────────────────────
        builder
            .addCase(createUserAsync.pending, (state) => {
                state.create_status = asyncStatus.LOADING;
                state.create_error = null;
            })
            .addCase(createUserAsync.fulfilled, (state, { payload }) => {
                state.create_status = asyncStatus.SUCCEEDED;
                const createdUser = payload?.user;
                
                if (createdUser && createdUser._id) {
                    state.users.unshift(createdUser);
                    state.pagination.total += 1;
                }
            })
            .addCase(createUserAsync.rejected, (state, { payload }) => {
                state.create_status = asyncStatus.ERROR;
                state.create_error = payload;
            });

        // ─── UPDATE USER ──────────────────────────────────────────
        builder
            .addCase(updateUserAsync.pending, (state) => {
                state.update_status = asyncStatus.LOADING;
                state.update_error = null;
            })
            .addCase(updateUserAsync.fulfilled, (state, { payload }) => {
                state.update_status = asyncStatus.SUCCEEDED;
                const updatedUser = payload?.user;
                
                if (updatedUser && updatedUser._id) {
                    const idx = state.users.findIndex(u => u._id === updatedUser._id);
                    if (idx !== -1) {
                        state.users[idx] = updatedUser;
                    }
                }
            })
            .addCase(updateUserAsync.rejected, (state, { payload }) => {
                state.update_status = asyncStatus.ERROR;
                state.update_error = payload;
            });

        // ─── DELETE USER ──────────────────────────────────────────
        builder
            .addCase(deleteUserAsync.pending, (state) => {
                state.delete_status = asyncStatus.LOADING;
                state.delete_error = null;
            })
            .addCase(deleteUserAsync.fulfilled, (state, { payload }) => {
                state.delete_status = asyncStatus.SUCCEEDED;
                state.users = state.users.filter(u => u._id !== payload.userId);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
            })
            .addCase(deleteUserAsync.rejected, (state, { payload }) => {
                state.delete_status = asyncStatus.ERROR;
                state.delete_error = payload;
            });
    },
});

export const {
    resetCreateStatus,
    resetUpdateStatus,
    resetDeleteStatus,
} = userSlice.actions;

export default userSlice.reducer;