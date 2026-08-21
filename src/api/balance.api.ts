import { api } from "./client";
import { Balance, ApiResponse } from "../types";

export interface DepositPayload {
  assetSymbol: string; // e.g. "USDT", "BTC", "ETH", "SOL", "INR"
  amount: string;
}

export const balanceApi = {
  /**
   * Fetch all balances for authenticated user
   */
  async getBalances(): Promise<Balance[]> {
    const res = await api.get<ApiResponse<Balance[]>>("/balances");
    return res.data.data;
  },

  /**
   * Fetch specific balance by asset symbol
   */
  async getBalanceByAsset(asset: string): Promise<Balance> {
    const res = await api.get<ApiResponse<Balance>>(`/balances/${asset}`);
    return res.data.data;
  },

  /**
   * Simulate instant deposit of crypto/fiat funds
   */
  async deposit(payload: DepositPayload): Promise<Balance> {
    const res = await api.post<ApiResponse<Balance>>("/balances/deposit", payload);
    return res.data.data;
  },
};
