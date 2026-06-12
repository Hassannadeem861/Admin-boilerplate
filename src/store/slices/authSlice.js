import { createSlice } from "@reduxjs/toolkit";
import { loginAsync, logoutAsync, checkAuthAsync } from "../services/authService";
import { asyncStatus } from "../../utils/asyncStatus";
import { SAVE_TOKENS_CONSTANT } from "../../utils/constant";

// ─────────────────────────────────────────────
// TOKEN HELPERS
// ─────────────────────────────────────────────
const saveTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(SAVE_TOKENS_CONSTANT.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(SAVE_TOKENS_CONSTANT.REFRESH_TOKEN, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(SAVE_TOKENS_CONSTANT.ACCESS_TOKEN);
  localStorage.removeItem(SAVE_TOKENS_CONSTANT.REFRESH_TOKEN);
};

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────
const initialState = {
  // Auth
  user_data: null,
  user_auth: !!localStorage.getItem(SAVE_TOKENS_CONSTANT.ACCESS_TOKEN),
  accessToken: localStorage.getItem(SAVE_TOKENS_CONSTANT.ACCESS_TOKEN) || null,
  refreshToken: localStorage.getItem(SAVE_TOKENS_CONSTANT.REFRESH_TOKEN) || null,
  user_role: null,

  // Login
  login_status: asyncStatus.IDLE,
  login_data: null,
  login_error: null,

  // Logout
  logout_auth_status: asyncStatus.IDLE,
  logout_auth_error: null,

  // Check Auth
  check_auth_status: asyncStatus.IDLE,
  check_auth_data: null,
  check_auth_error: null,
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────
const userAuthSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    // Sync logout — use the axios interceptor in 401 response
    logout: (state) => {
      state.user_data = null;
      state.user_auth = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user_role = null;
      state.login_status = asyncStatus.IDLE;
      clearTokens();
    },

    setLoginStatus: (state) => {
      state.login_status = asyncStatus.IDLE;
    },

    setLogoutStatus: (state) => {
      state.logout_auth_status = asyncStatus.IDLE;
    },

    setCheckAuthStatus: (state) => {
      state.check_auth_status = asyncStatus.IDLE;
    },
  },

  extraReducers: (builder) => {

    // =========>>>>>>> Login <<<<<===========

    builder.addCase(loginAsync.pending, (state) => {
      state.login_status = asyncStatus.LOADING;
      state.login_error = null;
    });

    builder.addCase(loginAsync.fulfilled, (state, { payload }) => {
      console.log("Login fulfilled payload: ", payload);
      state.login_status = asyncStatus.SUCCEEDED;
      state.login_data = payload;

      // payload = { success: true, token: "...", admin: {...} }
      if (payload?.status && payload?.user) {
        state.user_data = payload.user;
        state.user_role = payload.user?.role;
        state.accessToken = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.user_auth = true;
        saveTokens(payload.accessToken, payload.refreshToken);
      }
    });

    builder.addCase(loginAsync.rejected, (state, { payload }) => {
      state.login_status = asyncStatus.ERROR;
      state.login_error = payload;
      state.user_auth = false;
    });

    // =========>>>>>>> Logout <<<<<===========

    builder.addCase(logoutAsync.pending, (state) => {
      state.logout_auth_status = asyncStatus.LOADING;
    });

    builder.addCase(logoutAsync.fulfilled, (state) => {
      state.logout_auth_status = asyncStatus.SUCCEEDED;
      state.user_data = null;
      state.user_auth = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.user_role = null;
      clearTokens();
    });

    builder.addCase(logoutAsync.rejected, (state, { payload }) => {
      state.logout_auth_status = asyncStatus.ERROR;
      state.logout_auth_error = payload;
      // clear the error
      state.user_data = null;
      state.user_auth = false;
      state.accessToken = null;
      state.refreshToken = null;
      clearTokens();
    });

    // =========>>>>>>> Check Auth <<<<<===========

    builder.addCase(checkAuthAsync.pending, (state) => {
      state.check_auth_status = asyncStatus.LOADING;
    });

    builder.addCase(checkAuthAsync.fulfilled, (state, { payload }) => {
      state.check_auth_status = asyncStatus.SUCCEEDED;
      state.check_auth_data = payload;

      console.log("Check Auth fulfilled payload: ", payload);
      if (payload?.status && payload?.user) {
        state.user_data = payload.user;
        state.user_role = payload.user?.role;
        state.user_auth = true;

        if (payload?.accessToken) {
          state.accessToken = payload.accessToken;
          state.refreshToken = payload.refreshToken;
          saveTokens(payload.accessToken, payload.refreshToken);
        }
      }
    });

    builder.addCase(checkAuthAsync.rejected, (state, { payload }) => {
      state.check_auth_status = asyncStatus.ERROR;
      state.check_auth_error = payload;
      state.user_auth = false;
      state.user_data = null;
      clearTokens();
    });
  },
});

export const {
  logout,
  setLoginStatus,
  setLogoutStatus,
  setCheckAuthStatus,
} = userAuthSlice.actions;

export default userAuthSlice.reducer;