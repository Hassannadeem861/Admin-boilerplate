import axios from "axios"
import toast from "react-hot-toast"
import { SAVE_TOKENS_CONSTANT } from "./constant.js";

// ------------------- BASE URLs -------------------
// export const baseURL = 'http://localhost:5173/'; // local dev backend
export const baseURL = import.meta.env.VITE_SERVER_URL // live backend
// console.log("baseURL: ", baseURL);

// ------------------- Axios Instance -------------------
export const apiHandle = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
})

// ------------------- Session Expired Handler -------------------
// export const sessionExpired = async () => {
//   localStorage.clear() // Remove tokens
//   store.dispatch(logout()) // Redux logout
//   toast.error("Session expired. Please login again.")
//   window.location.href = "/login" // Redirect to login
// }

export const sessionExpired = async () => {
  localStorage.clear()

  // Lazy import — file load hone ke baad import hoga
  const { store } = await import("../store/store.js")
  const { logout } = await import("../store/slices/authSlice.js")

  store.dispatch(logout())
  toast.error("Session expired. Please login again.")
  window.location.href = "/login"
}

// ------------------- Token Refresh Handler -------------------
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem(SAVE_TOKENS_CONSTANT.REFRESH_TOKEN)
  console.log("Get all interceptor refreshToken: ", refreshToken)
  if (!refreshToken) throw new Error("No refresh token found")

  try {
    const response = await axios.post(`${baseURL}/auth/refreshtoken`, {
      refreshToken
    })

    const { token } = response.data
    console.log("Get all interceptor token: ", token)

    localStorage.setItem(SAVE_TOKENS_CONSTANT.ACCESS_TOKEN, token) // Save new access token
    return token
  } catch (err) {
    sessionExpired()
    throw err
  }
}

// ------------------- Request Interceptor -------------------
apiHandle.interceptors.request.use(
  config => {
    const token = localStorage.getItem(SAVE_TOKENS_CONSTANT.ACCESS_TOKEN)
    // console.log("interceptors ACCESS_TOKEN :", token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ------------------- Response Interceptor -------------------
apiHandle.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const status = error.response?.status

    // 401 Unauthorized -> Try token refresh once
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const newAccessToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return await axios(originalRequest) // Retry original request
      } catch (err) {
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)


// Get tokens from storage
export const getTokens = async () => {
  const accessToken = await localStorage.getItem(
    SAVE_TOKENS_CONSTANT.ACCESS_TOKEN,
  );
  const refreshToken = await localStorage.getItem(
    SAVE_TOKENS_CONSTANT.REFRESH_TOKEN,
  );
  return { accessToken, refreshToken };
};

// Save tokens to storage
export const saveTokens = async (accessToken, refreshToken) => {
  await localStorage.multiSet([
    [SAVE_TOKENS_CONSTANT.ACCESS_TOKEN, accessToken],
    [SAVE_TOKENS_CONSTANT.REFRESH_TOKEN, refreshToken],
  ]);
};

// Clear tokens
export const clearTokens = async () => {
  console.log('Clearing tokens');
  await localStorage.multiRemove([
    SAVE_TOKENS_CONSTANT.ACCESS_TOKEN,
    SAVE_TOKENS_CONSTANT.REFRESH_TOKEN,
  ]);
  // RNRestart.restart();
};