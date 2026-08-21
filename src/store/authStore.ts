import { create } from "zustand";
import { User } from "../types";
import { authApi, LoginPayload, RegisterPayload } from "../api/auth.api";
import { storage } from "../utils/storage";
import { APP_CONFIG } from "../constants/config";
import { getErrorMessage } from "../utils/errorHandler";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  isDemoMode: boolean;
  enterDemoMode: () => void;
  error: string | null;

  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrating: true,
  isDemoMode: false,
  enterDemoMode: () => set({ isDemoMode: true }),
  error: null,

  clearError: () => set({ error: null }),

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authApi.login(payload);
      await storage.setItem(APP_CONFIG.tokenStorageKey, data.accessToken);
      await storage.setItem(APP_CONFIG.userStorageKey, JSON.stringify(data.user));

      set({
        user: data.user,
        token: data.accessToken,
        isAuthenticated: true,
        isDemoMode: false,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      const msg = getErrorMessage(err, "Invalid credentials. Please check your details.");
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(payload);
      return await get().login({
        identifier: payload.email,
        password: payload.password,
      });
    } catch (err) {
      const msg = getErrorMessage(err, "Registration failed. Email or username might already exist.");
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await storage.removeItem(APP_CONFIG.tokenStorageKey);
    await storage.removeItem(APP_CONFIG.userStorageKey);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isDemoMode: false,
      error: null,
    });
  },

  hydrate: async () => {
    set({ isHydrating: true });
    try {
      const token = await storage.getItem(APP_CONFIG.tokenStorageKey);
      if (!token) {
        set({ isHydrating: false, isAuthenticated: false, user: null, token: null });
        return;
      }

      const user = await authApi.getMe();
      set({
        user,
        token,
        isAuthenticated: true,
        isHydrating: false,
      });
    } catch (err) {
      console.warn("[AuthStore] Token hydration failed or expired:", err);
      await storage.removeItem(APP_CONFIG.tokenStorageKey);
      await storage.removeItem(APP_CONFIG.userStorageKey);
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isHydrating: false,
      });
    }
  },
}));
