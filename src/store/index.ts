import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// API
import { baseApi } from "./api/baseApi";

// Slices
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    // API reducer
    [baseApi.reducerPath]: baseApi.reducer,
    // Feature slices
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Enable refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for usage in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Re-export API hooks for convenience
export * from "./api/pickupsApi";
export * from "./api/usersApi";
export * from "./api/dashboardApi";
export * from "./api/reportsApi";
export * from "./slices/uiSlice";
