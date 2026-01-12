import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarOpen: boolean;
  notificationPanelOpen: boolean;
  activeMenuItem: string;
  theme: "light" | "dark" | "system";
  isLoading: boolean;
}

const initialState: UiState = {
  sidebarOpen: false,
  notificationPanelOpen: false,
  activeMenuItem: "dashboard",
  theme: "light",
  isLoading: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
    setNotificationPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.notificationPanelOpen = action.payload;
    },
    setActiveMenuItem: (state, action: PayloadAction<string>) => {
      state.activeMenuItem = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleNotificationPanel,
  setNotificationPanelOpen,
  setActiveMenuItem,
  setTheme,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
