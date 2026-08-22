import { AxiosError } from "axios";
import { ApiResponse } from "../types";

/**
 * Extracts a clean, human-readable error message from backend Axios errors
 */
export const getErrorMessage = (error: unknown, fallback = "An unexpected error occurred."): string => {
  if (!error) return fallback;

  const axiosError = error as AxiosError<ApiResponse<unknown>>;
  if (axiosError.response?.data?.error?.message) {
    return axiosError.response.data.error.message;
  }

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError.code === "ECONNABORTED" || axiosError.message?.includes("timeout")) {
    return "Server is waking up (Render free tier). Please try again in 5 seconds.";
  }

  if (axiosError.message) {
    if (axiosError.message.includes("Network Error")) {
      return "Server connecting... Please tap once more to proceed.";
    }
    return axiosError.message;
  }

  return fallback;
};
