import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Hardware-backed encrypted storage for Mobile (iOS Keychain / Android Keystore)
 * Falls back safely to memory/localStorage on web
 */
export const storage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error("[SecureStore] setItem error for key:", key, error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error("[SecureStore] getItem error for key:", key, error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error("[SecureStore] removeItem error for key:", key, error);
    }
  },
};
