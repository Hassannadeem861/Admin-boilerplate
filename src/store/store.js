import { configureStore, combineReducers } from "@reduxjs/toolkit"
// import themeReducer from "./slices/themeSlice"
import authReducer from "./slices/authSlice"
import userReducer from './slices/userSlice.js';
import dashboardReducer from './slices/dashboardSlice.js';
import recoveryReducer from './slices/recoverySlice.js';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from "redux-persist"
// import storage from "redux-persist/lib/storage"
import storage from "redux-persist/es/storage";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"] // persist these slices
}

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  dashboard: dashboardReducer,
  recovery: recoveryReducer,
  // theme: themeReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

export const persistor = persistStore(store)
