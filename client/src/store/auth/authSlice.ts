import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LoggingData {
  displayName: string;
  email: string;
  username: string;
  _id: string;
  role?: 'admin' | 'user';
}

interface AuthState {
  isLogged: boolean;
  loggingData: LoggingData | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isLogged: false,
  loggingData: null,
  accessToken: null,
  refreshToken: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        user: LoggingData;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.isLogged = true;
      state.loggingData = action.payload.user;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.isLogged = false;
      state.loggingData = null;
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    refreshToken: (
      state,
      action: PayloadAction<{
        user: LoggingData;
        accessToken: string;
        refreshToken?: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('accessToken', action.payload.accessToken);

      // Update refresh token if provided
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }

      // Optionally update user data if needed
      if (action.payload.user) {
        state.loggingData = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    loadUserFromStorage: (state) => {
      const user = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (user && accessToken && refreshToken) {
        try {
          state.isLogged = true;
          state.loggingData = JSON.parse(user);
          state.accessToken = accessToken;
          state.refreshToken = refreshToken;
        } catch (error) {
          // If parsing fails, reset the state and clear localStorage
          state.isLogged = false;
          state.loggingData = null;
          state.accessToken = null;
          state.refreshToken = null;
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          console.error('Failed to parse user data from localStorage:', error);
        }
      } else {
        // If user or tokens are missing, ensure state is reset
        state.isLogged = false;
        state.loggingData = null;
        state.accessToken = null;
        state.refreshToken = null;
      }
    },
  },
});

export const { login, logout, setLoading, loadUserFromStorage, refreshToken } =
  authSlice.actions;
export default authSlice.reducer;
