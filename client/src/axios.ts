import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { store } from './store/store';
import authServices from './services/authServices/authServices';
import { refreshToken } from './store/auth/authSlice';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

interface RetryAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Define proper types for the queue
interface QueuePromise {
  resolve: (token: string | null) => void;
  reject: (error: Error) => void;
}

// Add a flag to prevent multiple refresh attempts at the same time
let isRefreshing = false;
// Store pending requests to retry
let failedQueue: QueuePromise[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const accessToken = state?.auth?.accessToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig;

    // If the error is 401 and we haven't tried refreshing yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      store.getState().auth.isLogged
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, wait for it to complete
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (!originalRequest.headers) originalRequest.headers = {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark that we're starting the refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from store
        const refreshTokenValue = store.getState().auth.refreshToken;

        if (!refreshTokenValue) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint with refresh token
        const response = await authServices.refreshToken(refreshTokenValue);

        if (!response || !response.accessToken) {
          throw new Error(
            typeof response === 'object' && response?.message
              ? response.message
              : 'Failed to refresh token'
          );
        }

        // Update the token in Redux (include new refresh token if provided)
        store.dispatch(
          refreshToken({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken, // Include the new refresh token
            user: response.user,
          })
        );

        // Set the new token on the original request
        axiosInstance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${response.accessToken}`;
        if (!originalRequest.headers) originalRequest.headers = {};
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;

        // Process any requests that were waiting
        processQueue(null, response.accessToken);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError: unknown) {
        // If refresh throws an exception, log the user out
        let message = 'Failed to refresh token';
        if (axios.isAxiosError(refreshError)) {
          const data = refreshError.response?.data as
            | { message?: string }
            | undefined;
          message = data?.message || refreshError.message || message;
        } else if (refreshError instanceof Error) {
          message = refreshError.message || message;
        }

        processQueue(new Error(message), null);
        store.dispatch({ type: 'auth/logout' });

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
