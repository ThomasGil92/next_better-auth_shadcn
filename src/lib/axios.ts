import axios, { InternalAxiosRequestConfig } from "axios";
import { authClient } from "./auth-client";

// Constants
const TOKEN_KEY = "auth_token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "";

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Token management
const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

const storeToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const clearStoredToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Request queue management
interface QueuedRequest {
  resolve: (value: string | PromiseLike<string>) => void;
  reject: (reason?: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (
  error: Error | null,
  token: string | null = null,
): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      // On s'assure de toujours passer une chaîne non-undefined
      resolve(token || "");
    }
  });
  failedQueue = [];
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip if it's a refresh token request
    if (config.url?.includes("/auth/token")) {
      return config;
    }

    // Check for stored token first
    const storedToken = getStoredToken();
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
      return config;
    }

    // If no stored token, try to get from session
    try {
      const { data: session } = await authClient.getSession();
      const token = session?.session?.token;

      if (token) {
        storeToken(token);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get session:", error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If it's not a 401 error, reject immediately
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Prevent infinite loops on refresh token endpoint
    if (
      originalRequest.url?.includes("/auth/token") ||
      originalRequest._retry
    ) {
      // Redirect to login page
      if (typeof window !== "undefined") {
        clearStoredToken();
        await authClient.signOut();
        window.location.href = "/signin";
      }
      return Promise.reject(error);
    }

    // Mark that we've already tried to refresh the token
    originalRequest._retry = true;

    if (isRefreshing) {
      // If refresh is already in progress, queue the request
      try {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });

        if (newToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    isRefreshing = true;

    try {
      // Try to get a new token using the refresh token
      const { data } = await axios.post(
        `${APP_URL}/api/auth/token`,
        {},
        { withCredentials: true },
      );

      if (!data.token) {
        throw new Error("No token received from refresh endpoint");
      }

      // Store the new token
      storeToken(data.token);

      // Update the original request with the new token
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${data.token}`;

      // Process any queued requests with the new token
      processQueue(null, data.token);

      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // If refresh fails, clear auth and redirect to login
      processQueue(
        refreshError instanceof Error
          ? refreshError
          : new Error("Token refresh failed"),
      );
      if (typeof window !== "undefined") {
        clearStoredToken();
        await authClient.signOut();
        window.location.href = "/signin";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
