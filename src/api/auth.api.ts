import { api } from "./client";
import { User, ApiResponse } from "../types";

export interface LoginPayload {
  identifier: string; // email or username
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponseData {
  user: User;
  accessToken: string;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<LoginResponseData> {
    const res = await api.post<ApiResponse<LoginResponseData>>("/auth/login", payload);
    return res.data.data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post<ApiResponse<User>>("/auth/register", payload);
    return res.data.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },
};
