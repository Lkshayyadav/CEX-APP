import { create } from "zustand";
import { Balance } from "../types";
import { balanceApi, DepositPayload } from "../api/balance.api";
import { getErrorMessage } from "../utils/errorHandler";
import * as Haptics from "expo-haptics";

interface BalanceState {
  balances: Balance[];
  totalPortfolioUsd: number;
  isLoading: boolean;
  isDepositing: boolean;
  error: string | null;
  depositSuccess: string | null;

  fetchBalances: () => Promise<void>;
  depositFunds: (payload: DepositPayload) => Promise<boolean>;
  clearDepositStatus: () => void;
}

export const useBalanceStore = create<BalanceState>((set, get) => ({
  balances: [],
  totalPortfolioUsd: 0,
  isLoading: false,
  isDepositing: false,
  error: null,
  depositSuccess: null,

  clearDepositStatus: () => set({ error: null, depositSuccess: null }),

  fetchBalances: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await balanceApi.getBalances();

      let total = 0;
      data.forEach((b) => {
        const free = parseFloat(b.free) || 0;
        const locked = parseFloat(b.locked) || 0;
        const qty = free + locked;
        const sym = b.asset?.symbol?.toUpperCase();

        if (sym === "USDT") total += qty;
        else if (sym === "BTC") total += qty * 50000;
        else if (sym === "ETH") total += qty * 3845.2;
        else if (sym === "SOL") total += qty * 186.75;
      });

      set({ balances: data, totalPortfolioUsd: total, isLoading: false });
    } catch (err) {
      set({ error: getErrorMessage(err), isLoading: false });
    }
  },

  depositFunds: async (payload: DepositPayload) => {
    set({ isDepositing: true, error: null, depositSuccess: null });
    try {
      await balanceApi.deposit(payload);
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}

      await get().fetchBalances();
      set({
        isDepositing: false,
        depositSuccess: `Successfully deposited ${payload.amount} ${payload.assetSymbol} into your wallet!`,
      });
      return true;
    } catch (err) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}

      set({
        error: getErrorMessage(err, "Deposit failed. Check server connection."),
        isDepositing: false,
      });
      return false;
    }
  },
}));
