import axios from "axios";
import { APP_CONFIG } from "../constants/config";
import { storage } from "../utils/storage";

export const api = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request Interceptor: Attach JWT from Hardware-backed SecureStore
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem(APP_CONFIG.tokenStorageKey);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle global 401 unauthenticated states gracefully
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized - Session expired or invalid token.");
      // In Phase 3 AuthStore, we will hook an automatic clean logout listener here
    }
    return Promise.reject(error);
  }
);
