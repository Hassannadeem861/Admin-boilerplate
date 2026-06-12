import { createSlice } from "@reduxjs/toolkit";
import { asyncStatus } from "../../utils/asyncStatus";
import {
    getRecoveryQuestionsAsync,
    createRecoveryQuestionAsync,
    updateRecoveryQuestionAsync,
    deleteRecoveryQuestionAsync,
} from "../services/recoveryService";

const initialState = {
    questions: [],
    get_status: asyncStatus.IDLE,
    get_error: null,
    create_status: asyncStatus.IDLE,
    create_error: null,
    update_status: asyncStatus.IDLE,
    update_error: null,
    delete_status: asyncStatus.IDLE,
    delete_error: null,
};

const recoverySlice = createSlice({
    name: "recovery",
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
        // Get All
        builder
            .addCase(getRecoveryQuestionsAsync.pending, (state) => {
                state.get_status = asyncStatus.LOADING;
                state.get_error = null;
            })
            .addCase(getRecoveryQuestionsAsync.fulfilled, (state, { payload }) => {
                state.get_status = asyncStatus.SUCCEEDED;
                state.questions = payload?.questions || [];
            })
            .addCase(getRecoveryQuestionsAsync.rejected, (state, { payload }) => {
                state.get_status = asyncStatus.ERROR;
                state.get_error = payload;
            });

        // Create
        builder
            .addCase(createRecoveryQuestionAsync.pending, (state) => {
                state.create_status = asyncStatus.LOADING;
                state.create_error = null;
            })
            .addCase(createRecoveryQuestionAsync.fulfilled, (state, { payload }) => {
                state.create_status = asyncStatus.SUCCEEDED;
                const newQuestion = payload?.recoveryQuestion;
                if (newQuestion) {
                    state.questions.unshift(newQuestion);
                }
            })
            .addCase(createRecoveryQuestionAsync.rejected, (state, { payload }) => {
                state.create_status = asyncStatus.ERROR;
                state.create_error = payload;
            });

        // Update
        builder
            .addCase(updateRecoveryQuestionAsync.pending, (state) => {
                state.update_status = asyncStatus.LOADING;
                state.update_error = null;
            })
            .addCase(updateRecoveryQuestionAsync.fulfilled, (state, { payload }) => {
                state.update_status = asyncStatus.SUCCEEDED;
                const updated = payload?.updatedQuestion;
                if (updated) {
                    const idx = state.questions.findIndex(q => q._id === updated._id);
                    if (idx !== -1) {
                        state.questions[idx] = updated;
                    }
                }
            })
            .addCase(updateRecoveryQuestionAsync.rejected, (state, { payload }) => {
                state.update_status = asyncStatus.ERROR;
                state.update_error = payload;
            });

        // Delete
        builder
            .addCase(deleteRecoveryQuestionAsync.pending, (state) => {
                state.delete_status = asyncStatus.LOADING;
                state.delete_error = null;
            })
            .addCase(deleteRecoveryQuestionAsync.fulfilled, (state, { payload }) => {
                state.delete_status = asyncStatus.SUCCEEDED;
                state.questions = state.questions.filter(q => q._id !== payload.questionId);
            })
            .addCase(deleteRecoveryQuestionAsync.rejected, (state, { payload }) => {
                state.delete_status = asyncStatus.ERROR;
                state.delete_error = payload;
            });
    },
});

export const {
    resetCreateStatus,
    resetUpdateStatus,
    resetDeleteStatus,
} = recoverySlice.actions;

export default recoverySlice.reducer;