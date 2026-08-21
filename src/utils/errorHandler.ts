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

  if (axiosError.message) {
    if (axiosError.message.includes("Network Error")) {
      return "Unable to connect to CEX servers. Check your internet connection.";
    }
    return axiosError.message;
  }

  return fallback;
};
