import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiHandle } from "../../utils/apiHandle";
import { typeConstants } from "../../utils/constant";

export const getRecoveryQuestionsAsync = createAsyncThunk(
    typeConstants.GET_RECOVERY_QUESTIONS,
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiHandle.get("api/recovery/getall");
            return response?.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to fetch questions"
            );
        }
    }
);

export const createRecoveryQuestionAsync = createAsyncThunk(
    typeConstants.CREATE_RECOVERY_QUESTION,
    async (payload, { rejectWithValue }) => {
        try {
            const response = await apiHandle.post("api/recovery/create", payload);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to create question"
            );
        }
    }
);

export const updateRecoveryQuestionAsync = createAsyncThunk(
    typeConstants.UPDATE_RECOVERY_QUESTION,
    async ({ id, ...body }, { rejectWithValue }) => {
        try {
            const response = await apiHandle.put(`api/recovery/update/${id}`, body);
            return { ...response.data, questionId: id };
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to update question"
            );
        }
    }
);

export const deleteRecoveryQuestionAsync = createAsyncThunk(
    typeConstants.DELETE_RECOVERY_QUESTION,
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiHandle.delete(`api/recovery/delete/${id}`);
            return { ...response.data, questionId: id };
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || error?.message || "Failed to delete question"
            );
        }
    }
);