import axios from "axios";
import { APP_CONFIG } from "../constants/config";
import { storage } from "../utils/storage";

export const api = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: 45000, // 45 seconds to accommodate Render free-tier cold-start wake-up
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

// Response Interceptor: Auto-retry on cold-start timeouts and handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Auto-retry once on network timeout/cold-start (status 0 or ECONNABORTED)
    if (config && !config._retry && (error.code === "ECONNABORTED" || !error.response)) {
      config._retry = true;
      config.timeout = 50000;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return api(config);
    }

    if (error.response?.status === 401) {
      console.warn("[API] 401 Unauthorized - Session expired or invalid token.");
    }
    return Promise.reject(error);
  }
);
