import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { authClient } from "./auth-client";

const TOKEN_KEY = "auth_token";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Simple token storage
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
const setToken = (token: string) => {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
};
export const clearToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
};

// Request queue for token refresh
let isRefreshing = false;
let failedQueue: Array<() => void> = [];

const processQueue = (error?: Error) => {
  failedQueue.forEach((promise) => (error ? promise() : promise()));
  failedQueue = [];
};

// Refresh token function
const refreshToken = async () => {
  try {
    let newToken: string | null = null;

    await authClient.getSession({
      fetchOptions: {
        onSuccess: (ctx: any) => {
          newToken = ctx.response.headers.get("set-auth-jwt");
          if (newToken) setToken(newToken);
        },
      },
    });

    if (!newToken) throw new Error("No token received");
    return newToken;
  } catch (error) {
    clearToken();
    if (typeof window !== "undefined") {
      await authClient.signOut();
      window.location.href = "/signin";
    }
    throw error;
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Skip if not 401 or already retried
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push(() => {
          originalRequest.headers.Authorization = `Bearer ${getToken()}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const newToken = await refreshToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      processQueue();
      return api(originalRequest);
    } catch (error) {
      processQueue(error);
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
